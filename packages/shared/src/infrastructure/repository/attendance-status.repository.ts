import type { Prisma, PrismaClient } from "#generated/client";
import {
  type AttendanceStatusEntity,
  attendanceStatusSelect,
} from "#selects/attendance-status.select";

export interface CreateAttendanceStatusInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateAttendanceStatusInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface AttendanceStatusPaginationMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface AttendanceStatusPage {
  data: AttendanceStatusEntity[];
  meta: AttendanceStatusPaginationMeta;
}

export class AttendanceStatusRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async create(
    institutionId: string,
    data: CreateAttendanceStatusInput,
  ): Promise<AttendanceStatusEntity> {
    const deleted = await this.prisma.attendanceStatuses.findFirst({
      where: { institution_id: institutionId, name: data.name },
      select: { id: true, deleted_at: true },
    });

    if (deleted?.deleted_at) {
      return this.prisma.attendanceStatuses.update({
        where: { id: deleted.id },
        data: {
          deleted_at: null,
          description: data.description ?? null,
          ...(data.color !== undefined ? { color: data.color } : {}),
          ...(data.icon !== undefined ? { icon: data.icon } : {}),
        },
        select: attendanceStatusSelect,
      });
    }

    return this.prisma.attendanceStatuses.create({
      data: {
        institution_id: institutionId,
        name: data.name,
        description: data.description ?? null,
        color: data.color ?? "#2563EB",
        icon: data.icon ?? "check",
      },
      select: attendanceStatusSelect,
    });
  }

  async findById(
    institutionId: string,
    id: string,
  ): Promise<AttendanceStatusEntity | null> {
    return this.prisma.attendanceStatuses.findFirst({
      where: { id, institution_id: institutionId, deleted_at: null },
      select: attendanceStatusSelect,
    });
  }

  async findByName(
    institutionId: string,
    name: string,
  ): Promise<AttendanceStatusEntity | null> {
    return this.prisma.attendanceStatuses.findFirst({
      where: { institution_id: institutionId, name, deleted_at: null },
      select: attendanceStatusSelect,
    });
  }

  async findAll(
    institutionId: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<AttendanceStatusPage> {
    const skip = (page - 1) * limit;
    const whereCondition: Prisma.AttendanceStatusesWhereInput = {
      institution_id: institutionId,
      deleted_at: null,
      ...(search
        ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.attendanceStatuses.findMany({
        where: whereCondition,
        skip,
        take: limit,
        select: attendanceStatusSelect,
        orderBy: { created_at: "desc" },
      }),
      this.prisma.attendanceStatuses.count({ where: whereCondition }),
    ]);

    return {
      data,
      meta: {
        totalData,
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        perPage: limit,
      },
    };
  }

  async update(
    institutionId: string,
    id: string,
    data: UpdateAttendanceStatusInput,
  ): Promise<AttendanceStatusEntity> {
    const result = await this.prisma.attendanceStatuses.updateMany({
      where: { id, institution_id: institutionId, deleted_at: null },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
      },
    });
    if (result.count === 0) {
      throw new Error("Attendance status could not be updated");
    }
    const updated = await this.findById(institutionId, id);
    if (!updated) throw new Error("Attendance status could not be updated");
    return updated;
  }

  async countUsage(institutionId: string, id: string): Promise<number> {
    return this.prisma.attendances.count({
      where: {
        attendance_status_id: id,
        deleted_at: null,
        attendance_status: { institution_id: institutionId },
      },
    });
  }

  async delete(
    institutionId: string,
    id: string,
  ): Promise<AttendanceStatusEntity> {
    const result = await this.prisma.attendanceStatuses.updateMany({
      where: { id, institution_id: institutionId, deleted_at: null },
      data: { deleted_at: new Date() },
    });
    if (result.count === 0) {
      throw new Error("Attendance status could not be deleted");
    }
    const deleted = await this.prisma.attendanceStatuses.findFirst({
      where: { id, institution_id: institutionId },
      select: attendanceStatusSelect,
    });
    if (!deleted) throw new Error("Attendance status could not be deleted");
    return deleted;
  }
}
