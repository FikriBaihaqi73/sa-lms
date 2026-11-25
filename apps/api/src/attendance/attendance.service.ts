import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AttendanceRepository,
  type AttendanceSearchInput,
} from "@repo/shared/infrastructure/repository/attendance.repository";
import { AttendanceStatusRepository } from "@repo/shared/infrastructure/repository/attendance-status.repository";
import { ScheduleRepository } from "@repo/shared/infrastructure/repository/schedule.repository";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
import type {
  BulkUpsertAttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  UpsertAttendanceDto,
} from "@repo/shared/schemas/attendance.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AttendanceService {
  private readonly attendanceRepository: AttendanceRepository;
  private readonly attendanceStatusRepository: AttendanceStatusRepository;
  private readonly scheduleRepository: ScheduleRepository;
  private readonly studentRepository: StudentRepository;

  constructor(private readonly prisma: PrismaService) {
    this.attendanceRepository = new AttendanceRepository(this.prisma.client);
    this.attendanceStatusRepository = new AttendanceStatusRepository(
      this.prisma.client,
    );
    this.scheduleRepository = new ScheduleRepository(this.prisma.client);
    this.studentRepository = new StudentRepository(this.prisma.client);
  }

  private async institutionIdFor(userId?: string): Promise<string | undefined> {
    if (!userId) return undefined;
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile?.institutionId) {
      throw new ForbiddenException("Institution access is required");
    }
    return profile.institutionId;
  }

  async findAll(
    page: number,
    limit: number,
    filters?: AttendanceSearchInput,
    userId?: string,
  ) {
    const institutionId = await this.institutionIdFor(userId);
    return this.attendanceRepository.findAll(
      page,
      limit,
      filters,
      institutionId,
    );
  }

  async getSummary(filters?: AttendanceSearchInput, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    return this.attendanceRepository.getSummary(filters, institutionId);
  }

  async findOne(id: string, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    const attendance = await this.attendanceRepository.findById(
      id,
      institutionId,
    );
    if (!attendance) {
      throw new NotFoundException("Data presensi tidak ditemukan.");
    }
    return attendance;
  }

  async create(dto: CreateAttendanceDto, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    const resolved = await this.ensureRelationsExist(dto, institutionId);

    const attendanceDate = this.normalizeDate(dto.attendance_date);
    await this.ensureAttendanceDoesNotExist(
      resolved.schedule_id ??
        resolved.attendance_schedule_id ??
        dto.schedule_id,
      dto.student_id,
      attendanceDate,
    );

    return this.attendanceRepository.create({
      schedule_id: resolved.schedule_id,
      attendance_schedule_id: resolved.attendance_schedule_id,
      student_id: dto.student_id,
      attendance_status_id: dto.attendance_status_id,
      attendance_date: attendanceDate,
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    });
  }

  async upsert(dto: UpsertAttendanceDto, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    const resolved = await this.ensureRelationsExist(
      {
        schedule_id: dto.schedule_id,
        student_id: dto.student_id,
        attendance_status_id: dto.attendance_status_id,
      },
      institutionId,
    );

    const attendanceDate = this.normalizeDate(dto.attendance_date);
    if (!attendanceDate) {
      throw new NotFoundException("Format tanggal presensi tidak valid.");
    }

    return this.attendanceRepository.upsert({
      schedule_id: resolved.schedule_id,
      attendance_schedule_id: resolved.attendance_schedule_id,
      student_id: dto.student_id,
      attendance_status_id: dto.attendance_status_id,
      attendance_date: attendanceDate,
      notes: dto.notes ?? null,
    });
  }

  async bulkUpsert(dto: BulkUpsertAttendanceDto, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    const resolved = await this.resolveScheduleContext(
      dto.schedule_id,
      institutionId,
    );

    const status = institutionId
      ? await this.attendanceStatusRepository.findById(
          institutionId,
          dto.attendance_status_id,
        )
      : null;
    if (!status) {
      throw new NotFoundException(
        "Status kehadiran yang dipilih tidak ditemukan.",
      );
    }

    let studentIds = dto.student_ids ?? [];
    if (studentIds.length === 0) {
      const classId = resolved.class_id;
      if (!classId) {
        throw new NotFoundException(
          "Kelas untuk jadwal absensi ini tidak ditemukan.",
        );
      }
      const classStudents = await this.prisma.client.classStudent.findMany({
        where: { classId, deletedAt: null },
        select: { studentId: true },
      });
      studentIds = classStudents.map((cs) => cs.studentId);
    }

    if (studentIds.length === 0) {
      return [];
    }

    const attendanceDate = this.normalizeDate(dto.attendance_date);
    if (!attendanceDate) {
      throw new NotFoundException("Format tanggal presensi tidak valid.");
    }

    const records = studentIds.map((student_id) => ({
      schedule_id: resolved.schedule_id,
      attendance_schedule_id: resolved.attendance_schedule_id,
      student_id,
      attendance_status_id: dto.attendance_status_id,
      attendance_date: attendanceDate,
      notes: dto.notes ?? null,
    }));

    return this.attendanceRepository.bulkUpsert(records);
  }

  async update(id: string, dto: UpdateAttendanceDto, userId?: string) {
    const current = await this.findOne(id, userId);
    const institutionId = await this.institutionIdFor(userId);
    const targetScheduleInput =
      dto.schedule_id ??
      current.schedule_id ??
      current.attendance_schedule_id ??
      "";
    const studentId = dto.student_id ?? current.student_id;
    const attendanceDate =
      dto.attendance_date === undefined
        ? (current.attendance_date ?? undefined)
        : this.normalizeDate(dto.attendance_date);

    const resolved = await this.ensureRelationsExist(
      {
        schedule_id: targetScheduleInput,
        student_id: studentId,
        attendance_status_id:
          dto.attendance_status_id ?? current.attendance_status_id,
      },
      institutionId,
    );
    await this.ensureAttendanceDoesNotExist(
      resolved.schedule_id ??
        resolved.attendance_schedule_id ??
        targetScheduleInput,
      studentId,
      attendanceDate,
      id,
    );

    return this.attendanceRepository.update(id, {
      ...(dto.schedule_id !== undefined
        ? {
            schedule_id: resolved.schedule_id,
            attendance_schedule_id: resolved.attendance_schedule_id,
          }
        : {}),
      ...(dto.student_id !== undefined ? { student_id: dto.student_id } : {}),
      ...(dto.attendance_status_id !== undefined
        ? { attendance_status_id: dto.attendance_status_id }
        : {}),
      ...(dto.attendance_date !== undefined
        ? { attendance_date: attendanceDate }
        : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    });
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id, userId);
    await this.attendanceRepository.delete(id);
    return { success: true, id };
  }

  private async resolveScheduleContext(
    scheduleId: string,
    institutionId?: string,
  ): Promise<{
    schedule_id: string | null;
    attendance_schedule_id: string | null;
    class_id: string | null;
  }> {
    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (schedule) {
      if (
        institutionId &&
        schedule.classSubject?.class?.institution_id !== institutionId
      ) {
        throw new NotFoundException(
          "Jadwal pelajaran tidak ditemukan pada institusi ini.",
        );
      }
      return {
        schedule_id: schedule.id,
        attendance_schedule_id: null,
        class_id: schedule.classSubject?.class_id ?? null,
      };
    }

    const attendanceSchedule =
      await this.prisma.client.attendanceSchedules.findFirst({
        where: {
          id: scheduleId,
          deletedAt: null,
          ...(institutionId
            ? {
                class: {
                  institution_id: institutionId,
                  deleted_at: null,
                },
              }
            : {}),
        },
        select: {
          id: true,
          scheduleId: true,
          classId: true,
        },
      });

    if (attendanceSchedule) {
      return {
        schedule_id: attendanceSchedule.scheduleId ?? null,
        attendance_schedule_id: attendanceSchedule.id,
        class_id: attendanceSchedule.classId ?? null,
      };
    }

    throw new NotFoundException(
      "Jadwal absensi atau jadwal pelajaran tidak ditemukan.",
    );
  }

  private async ensureRelationsExist(
    data: {
      schedule_id: string;
      student_id: string;
      attendance_status_id: string;
    },
    institutionId?: string,
  ) {
    const [resolvedSchedule, student, attendanceStatus] = await Promise.all([
      this.resolveScheduleContext(data.schedule_id, institutionId),
      this.studentRepository.findById(data.student_id, institutionId),
      institutionId
        ? this.attendanceStatusRepository.findById(
            institutionId,
            data.attendance_status_id,
          )
        : Promise.resolve(null),
    ]);

    if (!student) {
      throw new NotFoundException(
        "Data siswa tidak ditemukan pada institusi ini.",
      );
    }
    if (!attendanceStatus) {
      throw new NotFoundException(
        "Status kehadiran yang dipilih tidak ditemukan.",
      );
    }

    return resolvedSchedule;
  }

  private async ensureAttendanceDoesNotExist(
    scheduleId: string,
    studentId: string,
    attendanceDate: Date | undefined,
    excludedId?: string,
  ) {
    if (!attendanceDate) return;
    const existing =
      await this.attendanceRepository.findByScheduleStudentAndDate(
        scheduleId,
        studentId,
        attendanceDate,
      );
    if (existing && existing.id !== excludedId) {
      throw new ConflictException(
        "Data presensi untuk siswa, jadwal, dan tanggal ini sudah ada.",
      );
    }
  }

  private normalizeDate(value: string | Date | undefined): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) {
      const y = value.getUTCFullYear();
      const m = String(value.getUTCMonth() + 1).padStart(2, "0");
      const d = String(value.getUTCDate()).padStart(2, "0");
      return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
    }
    const dateStr = value.split("T")[0];
    return new Date(`${dateStr}T00:00:00.000Z`);
  }
}
