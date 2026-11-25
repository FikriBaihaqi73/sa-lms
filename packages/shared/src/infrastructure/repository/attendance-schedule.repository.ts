import type { Prisma, PrismaClient } from "#generated/client";
import {
  type AttendanceScheduleEntity,
  attendanceScheduleSelect,
} from "#selects/attendance-schedule.select";

export interface CreateAttendanceScheduleRepoInput {
  academicYearId: string;
  classId: string;
  scheduleId?: string | null | undefined;
  title: string;
  scheduleType: string;
  activeDays: string[];
  specificDate?: Date | null | undefined;
  startTime?: Date | null | undefined;
  endTime?: Date | null | undefined;
  isActive: boolean;
  notes?: string | null | undefined;
}

export interface UpdateAttendanceScheduleRepoInput {
  academicYearId?: string | undefined;
  classId?: string | undefined;
  scheduleId?: string | null | undefined;
  title?: string | undefined;
  scheduleType?: string | undefined;
  activeDays?: string[] | undefined;
  specificDate?: Date | null | undefined;
  startTime?: Date | null | undefined;
  endTime?: Date | null | undefined;
  isActive?: boolean | undefined;
  notes?: string | null | undefined;
}

export interface AttendanceScheduleFilterInput {
  academicYearId?: string | undefined;
  classId?: string | undefined;
  scheduleType?: string | undefined;
  isActive?: boolean | undefined;
  search?: string | undefined;
  page: number;
  limit: number;
}

export interface AttendanceScheduleStats {
  total: number;
  active: number;
  inactive: number;
  standalone: number;
}

export interface AttendanceScheduleListResult {
  data: AttendanceScheduleEntity[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  stats: AttendanceScheduleStats;
}

export class AttendanceScheduleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(
    institutionId: string,
    query: AttendanceScheduleFilterInput,
  ): Promise<AttendanceScheduleListResult> {
    const skip = (query.page - 1) * query.limit;
    const baseWhere: Prisma.AttendanceSchedulesWhereInput = {
      deletedAt: null,
      class: {
        institution_id: institutionId,
        deleted_at: null,
      },
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.classId ? { classId: query.classId } : {}),
    };

    const searchTerm = query.search?.trim();
    const where: Prisma.AttendanceSchedulesWhereInput = {
      ...baseWhere,
      ...(query.scheduleType ? { scheduleType: query.scheduleType } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: "insensitive" } },
              {
                class: {
                  name: { contains: searchTerm, mode: "insensitive" },
                },
              },
              {
                schedule: {
                  classSubject: {
                    subject: {
                      name: { contains: searchTerm, mode: "insensitive" },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, totalData, total, active, inactive, standalone] =
      await Promise.all([
        this.prisma.attendanceSchedules.findMany({
          where,
          skip,
          take: query.limit,
          orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
          select: attendanceScheduleSelect,
        }),
        this.prisma.attendanceSchedules.count({ where }),
        this.prisma.attendanceSchedules.count({ where: baseWhere }),
        this.prisma.attendanceSchedules.count({
          where: { ...baseWhere, isActive: true },
        }),
        this.prisma.attendanceSchedules.count({
          where: { ...baseWhere, isActive: false },
        }),
        this.prisma.attendanceSchedules.count({
          where: { ...baseWhere, scheduleType: "STANDALONE" },
        }),
      ]);

    return {
      data,
      meta: {
        totalData,
        totalPages: Math.max(1, Math.ceil(totalData / query.limit)),
        currentPage: query.page,
        perPage: query.limit,
      },
      stats: {
        total,
        active,
        inactive,
        standalone,
      },
    };
  }

  async findById(
    institutionId: string,
    id: string,
  ): Promise<AttendanceScheduleEntity | null> {
    return this.prisma.attendanceSchedules.findFirst({
      where: {
        id,
        deletedAt: null,
        class: {
          institution_id: institutionId,
          deleted_at: null,
        },
      },
      select: attendanceScheduleSelect,
    });
  }

  async create(
    data: CreateAttendanceScheduleRepoInput,
  ): Promise<AttendanceScheduleEntity> {
    return this.prisma.attendanceSchedules.create({
      data: {
        academicYearId: data.academicYearId,
        classId: data.classId,
        scheduleId: data.scheduleId ?? null,
        title: data.title,
        scheduleType: data.scheduleType,
        activeDays: data.activeDays,
        specificDate: data.specificDate ?? null,
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        isActive: data.isActive,
        notes: data.notes ?? null,
      },
      select: attendanceScheduleSelect,
    });
  }

  async update(
    id: string,
    data: UpdateAttendanceScheduleRepoInput,
  ): Promise<AttendanceScheduleEntity> {
    return this.prisma.attendanceSchedules.update({
      where: { id },
      data: {
        ...(data.academicYearId !== undefined
          ? { academicYearId: data.academicYearId }
          : {}),
        ...(data.classId !== undefined ? { classId: data.classId } : {}),
        ...(data.scheduleId !== undefined
          ? { scheduleId: data.scheduleId }
          : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.scheduleType !== undefined
          ? { scheduleType: data.scheduleType }
          : {}),
        ...(data.activeDays !== undefined
          ? { activeDays: data.activeDays }
          : {}),
        ...(data.specificDate !== undefined
          ? { specificDate: data.specificDate }
          : {}),
        ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
        ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
      select: attendanceScheduleSelect,
    });
  }

  async toggleActive(
    id: string,
    isActive: boolean,
  ): Promise<AttendanceScheduleEntity> {
    return this.prisma.attendanceSchedules.update({
      where: { id },
      data: { isActive },
      select: attendanceScheduleSelect,
    });
  }

  async updateActiveDays(
    id: string,
    activeDays: string[],
  ): Promise<AttendanceScheduleEntity> {
    return this.prisma.attendanceSchedules.update({
      where: { id },
      data: { activeDays },
      select: attendanceScheduleSelect,
    });
  }

  async softDelete(id: string): Promise<AttendanceScheduleEntity> {
    return this.prisma.attendanceSchedules.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: attendanceScheduleSelect,
    });
  }
}
