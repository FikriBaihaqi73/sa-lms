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
      throw new NotFoundException("Attendance not found");
    }
    return attendance;
  }

  async create(dto: CreateAttendanceDto, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.ensureRelationsExist(dto, institutionId);

    const attendanceDate = this.normalizeDate(dto.attendance_date);
    await this.ensureAttendanceDoesNotExist(
      dto.schedule_id,
      dto.student_id,
      attendanceDate,
    );

    return this.attendanceRepository.create({
      schedule_id: dto.schedule_id,
      student_id: dto.student_id,
      attendance_status_id: dto.attendance_status_id,
      attendance_date: attendanceDate,
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    });
  }

  async upsert(dto: UpsertAttendanceDto, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.ensureRelationsExist(
      {
        schedule_id: dto.schedule_id,
        student_id: dto.student_id,
        attendance_status_id: dto.attendance_status_id,
      },
      institutionId,
    );

    const attendanceDate = this.normalizeDate(dto.attendance_date);
    if (!attendanceDate) {
      throw new NotFoundException("Invalid attendance date");
    }

    return this.attendanceRepository.upsert({
      schedule_id: dto.schedule_id,
      student_id: dto.student_id,
      attendance_status_id: dto.attendance_status_id,
      attendance_date: attendanceDate,
      notes: dto.notes ?? null,
    });
  }

  async bulkUpsert(dto: BulkUpsertAttendanceDto, userId?: string) {
    const institutionId = await this.institutionIdFor(userId);
    const schedule = await this.scheduleRepository.findById(dto.schedule_id);
    if (!schedule) throw new NotFoundException("Schedule not found");
    if (
      institutionId &&
      schedule.classSubject?.class?.institution_id !== institutionId
    ) {
      throw new NotFoundException("Schedule not found");
    }

    const status = institutionId
      ? await this.attendanceStatusRepository.findById(
          institutionId,
          dto.attendance_status_id,
        )
      : null;
    if (!status) throw new NotFoundException("Attendance status not found");

    let studentIds = dto.student_ids ?? [];
    if (studentIds.length === 0) {
      const classId = schedule.classSubject?.class_id;
      if (!classId) {
        throw new NotFoundException("Class not found for this schedule");
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
      throw new NotFoundException("Invalid attendance date");
    }

    const records = studentIds.map((student_id) => ({
      schedule_id: dto.schedule_id,
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
    const scheduleId = dto.schedule_id ?? current.schedule_id;
    const studentId = dto.student_id ?? current.student_id;
    const attendanceDate =
      dto.attendance_date === undefined
        ? (current.attendance_date ?? undefined)
        : this.normalizeDate(dto.attendance_date);

    await this.ensureRelationsExist(
      {
        schedule_id: scheduleId,
        student_id: studentId,
        attendance_status_id:
          dto.attendance_status_id ?? current.attendance_status_id,
      },
      institutionId,
    );
    await this.ensureAttendanceDoesNotExist(
      scheduleId,
      studentId,
      attendanceDate,
      id,
    );

    return this.attendanceRepository.update(id, {
      ...(dto.schedule_id !== undefined
        ? { schedule_id: dto.schedule_id }
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

  private async ensureRelationsExist(
    data: {
      schedule_id: string;
      student_id: string;
      attendance_status_id: string;
    },
    institutionId?: string,
  ) {
    const [schedule, student, attendanceStatus] = await Promise.all([
      this.scheduleRepository.findById(data.schedule_id),
      this.studentRepository.findById(data.student_id, institutionId),
      institutionId
        ? this.attendanceStatusRepository.findById(
            institutionId,
            data.attendance_status_id,
          )
        : Promise.resolve(null),
    ]);

    if (!schedule) throw new NotFoundException("Schedule not found");
    if (
      institutionId &&
      schedule.classSubject?.class?.institution_id !== institutionId
    ) {
      throw new NotFoundException("Schedule not found");
    }
    if (!student) throw new NotFoundException("Student not found");
    if (!attendanceStatus) {
      throw new NotFoundException("Attendance status not found");
    }
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
        "Attendance already exists for this student, schedule, and date",
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
