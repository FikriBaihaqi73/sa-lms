import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type AttendanceScheduleListResult,
  AttendanceScheduleRepository,
} from "@repo/shared/infrastructure/repository/attendance-schedule.repository";
import type {
  CreateAttendanceScheduleDto,
  ListAttendanceScheduleQueryDto,
  UpdateAttendanceScheduleDto,
} from "@repo/shared/schemas/attendance-schedule.schema";
import type { AttendanceScheduleEntity } from "@repo/shared/selects/attendance-schedule.select";
import { PrismaService } from "../prisma/prisma.service";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

function parseTimeToDate(value: string | null | undefined): Date | null {
  if (!value || value.trim() === "") return null;
  const trimmed = value.trim();
  const match = TIME_PATTERN.exec(trimmed);
  if (match) {
    const hours = match[1];
    const minutes = match[2];
    const seconds = match[3] ?? "00";
    return new Date(`1970-01-01T${hours}:${minutes}:${seconds}.000Z`);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException("Format waktu tidak valid");
  }
  return parsed;
}

function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value || value.trim() === "") return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException("Format tanggal tidak valid");
  }
  return parsed;
}

@Injectable()
export class AttendanceScheduleService {
  private readonly repository: AttendanceScheduleRepository;

  constructor(private readonly prisma: PrismaService) {
    this.repository = new AttendanceScheduleRepository(this.prisma.client);
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile?.institutionId) {
      throw new ForbiddenException("Institution access is required");
    }
    return profile.institutionId;
  }

  private async validateRelations(
    institutionId: string,
    params: {
      academicYearId: string;
      classId: string;
      scheduleId?: string | null | undefined;
      scheduleType: string;
    },
  ): Promise<void> {
    const [academicYear, classRecord] = await Promise.all([
      this.prisma.client.academicYears.findFirst({
        where: {
          id: params.academicYearId,
          deleted_at: null,
          OR: [{ institution_id: institutionId }, { institution_id: null }],
        },
        select: { id: true },
      }),
      this.prisma.client.classes.findFirst({
        where: {
          id: params.classId,
          institution_id: institutionId,
          deleted_at: null,
        },
        select: { id: true, academic_year_id: true },
      }),
    ]);

    if (!academicYear) {
      throw new NotFoundException("Tahun ajaran tidak ditemukan");
    }
    if (!classRecord) {
      throw new NotFoundException("Kelas tidak ditemukan di institusi Anda");
    }
    if (classRecord.academic_year_id !== params.academicYearId) {
      throw new BadRequestException(
        "Kelas yang dipilih tidak termasuk dalam tahun ajaran tersebut",
      );
    }

    if (params.scheduleType === "FROM_SCHEDULE") {
      if (!params.scheduleId) {
        throw new BadRequestException(
          "Jadwal pelajaran wajib dipilih untuk tipe FROM_SCHEDULE",
        );
      }
      const scheduleRecord = await this.prisma.client.schedule.findFirst({
        where: {
          id: params.scheduleId,
          deletedAt: null,
          classSubject: {
            class_id: params.classId,
            class: {
              institution_id: institutionId,
              deleted_at: null,
            },
          },
        },
        select: { id: true },
      });
      if (!scheduleRecord) {
        throw new NotFoundException(
          "Jadwal pelajaran tidak ditemukan untuk kelas yang dipilih",
        );
      }
    }
  }

  async findAll(
    userId: string,
    query: ListAttendanceScheduleQueryDto,
  ): Promise<AttendanceScheduleListResult> {
    const institutionId = await this.institutionIdFor(userId);
    const isActive =
      query.isActive === "true"
        ? true
        : query.isActive === "false"
          ? false
          : undefined;

    return this.repository.findAll(institutionId, {
      academicYearId: query.academicYearId,
      classId: query.classId,
      scheduleType: query.scheduleType,
      isActive,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  async findOne(userId: string, id: string): Promise<AttendanceScheduleEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.repository.findById(institutionId, id);
    if (!existing) {
      throw new NotFoundException("Jadwal absensi tidak ditemukan");
    }
    return existing;
  }

  async create(
    userId: string,
    dto: CreateAttendanceScheduleDto,
  ): Promise<AttendanceScheduleEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const scheduleId =
      dto.scheduleType === "STANDALONE" ? null : (dto.scheduleId ?? null);

    await this.validateRelations(institutionId, {
      academicYearId: dto.academicYearId,
      classId: dto.classId,
      scheduleId,
      scheduleType: dto.scheduleType,
    });

    const startTime = parseTimeToDate(dto.startTime);
    const endTime = parseTimeToDate(dto.endTime);
    if (startTime && endTime && endTime.getTime() <= startTime.getTime()) {
      throw new BadRequestException(
        "Jam selesai harus lebih besar dari jam mulai",
      );
    }

    return this.repository.create({
      academicYearId: dto.academicYearId,
      classId: dto.classId,
      scheduleId,
      title: dto.title.trim(),
      scheduleType: dto.scheduleType,
      activeDays: dto.activeDays,
      specificDate: parseDateOnly(dto.specificDate),
      startTime,
      endTime,
      isActive: dto.isActive,
      notes: dto.notes ?? null,
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAttendanceScheduleDto,
  ): Promise<AttendanceScheduleEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.repository.findById(institutionId, id);
    if (!existing) {
      throw new NotFoundException("Jadwal absensi tidak ditemukan");
    }

    const nextAcademicYearId = dto.academicYearId ?? existing.academicYearId;
    const nextClassId = dto.classId ?? existing.classId;
    const nextScheduleType = dto.scheduleType ?? existing.scheduleType;
    const nextScheduleId =
      nextScheduleType === "STANDALONE"
        ? null
        : dto.scheduleId !== undefined
          ? dto.scheduleId
          : existing.scheduleId;

    await this.validateRelations(institutionId, {
      academicYearId: nextAcademicYearId,
      classId: nextClassId,
      scheduleId: nextScheduleId,
      scheduleType: nextScheduleType,
    });

    const nextStartTime =
      dto.startTime !== undefined
        ? parseTimeToDate(dto.startTime)
        : existing.startTime;
    const nextEndTime =
      dto.endTime !== undefined
        ? parseTimeToDate(dto.endTime)
        : existing.endTime;

    if (
      nextStartTime &&
      nextEndTime &&
      nextEndTime.getTime() <= nextStartTime.getTime()
    ) {
      throw new BadRequestException(
        "Jam selesai harus lebih besar dari jam mulai",
      );
    }

    return this.repository.update(id, {
      ...(dto.academicYearId !== undefined
        ? { academicYearId: dto.academicYearId }
        : {}),
      ...(dto.classId !== undefined ? { classId: dto.classId } : {}),
      ...(dto.scheduleId !== undefined || nextScheduleType === "STANDALONE"
        ? { scheduleId: nextScheduleId }
        : {}),
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.scheduleType !== undefined
        ? { scheduleType: dto.scheduleType }
        : {}),
      ...(dto.activeDays !== undefined ? { activeDays: dto.activeDays } : {}),
      ...(dto.specificDate !== undefined
        ? { specificDate: parseDateOnly(dto.specificDate) }
        : {}),
      ...(dto.startTime !== undefined ? { startTime: nextStartTime } : {}),
      ...(dto.endTime !== undefined ? { endTime: nextEndTime } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    });
  }

  async toggleStatus(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<AttendanceScheduleEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.repository.findById(institutionId, id);
    if (!existing) {
      throw new NotFoundException("Jadwal absensi tidak ditemukan");
    }
    return this.repository.toggleActive(id, isActive);
  }

  async updateDays(
    userId: string,
    id: string,
    activeDays: string[],
  ): Promise<AttendanceScheduleEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.repository.findById(institutionId, id);
    if (!existing) {
      throw new NotFoundException("Jadwal absensi tidak ditemukan");
    }
    return this.repository.updateActiveDays(id, activeDays);
  }

  async remove(userId: string, id: string): Promise<AttendanceScheduleEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.repository.findById(institutionId, id);
    if (!existing) {
      throw new NotFoundException("Jadwal absensi tidak ditemukan");
    }
    return this.repository.softDelete(id);
  }
}
