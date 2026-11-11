import type { Prisma, PrismaClient } from "#generated/client";
import {
  type AttendanceEntity,
  attendanceSelect,
} from "#selects/attendance.select";

export interface CreateAttendanceInput {
  schedule_id: string;
  student_id: string;
  attendance_status_id: string;
  attendance_date?: Date | undefined;
  notes?: string | null | undefined;
}

export interface UpdateAttendanceInput {
  schedule_id?: string | undefined;
  student_id?: string | undefined;
  attendance_status_id?: string | undefined;
  attendance_date?: Date | undefined;
  notes?: string | null | undefined;
}

export interface UpsertAttendanceInput {
  schedule_id: string;
  student_id: string;
  attendance_status_id: string;
  attendance_date: Date;
  notes?: string | null | undefined;
}

export interface AttendanceSearchInput {
  search?: string | undefined;
  schedule_id?: string | undefined;
  student_id?: string | undefined;
  attendance_status_id?: string | undefined;
  attendance_date?: string | undefined;
  class_id?: string | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
  month?: number | string | undefined;
  year?: number | string | undefined;
}

export interface AttendancePaginationMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  permission: number;
  sick: number;
  absent: number;
  attendanceRate: number;
}

export class AttendanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private buildWhere(
    filters?: AttendanceSearchInput,
    institutionId?: string,
  ): Prisma.AttendancesWhereInput {
    const where: Prisma.AttendancesWhereInput = {
      deleted_at: null,
      ...(institutionId
        ? {
            schedule: {
              classSubject: {
                class: {
                  institution_id: institutionId,
                  deleted_at: null,
                },
                deleted_at: null,
              },
              deletedAt: null,
            },
          }
        : {}),
      ...(filters?.schedule_id ? { schedule_id: filters.schedule_id } : {}),
      ...(filters?.student_id ? { student_id: filters.student_id } : {}),
      ...(filters?.attendance_status_id
        ? { attendance_status_id: filters.attendance_status_id }
        : {}),
    };

    if (filters?.start_date && filters?.end_date) {
      const startDateStr = filters.start_date.split("T")[0];
      const endDateStr = filters.end_date.split("T")[0];
      where.attendance_date = {
        gte: new Date(`${startDateStr}T00:00:00.000Z`),
        lte: new Date(`${endDateStr}T23:59:59.999Z`),
      };
    } else if (filters?.start_date) {
      const startDateStr = filters.start_date.split("T")[0];
      where.attendance_date = {
        gte: new Date(`${startDateStr}T00:00:00.000Z`),
      };
    } else if (filters?.end_date) {
      const endDateStr = filters.end_date.split("T")[0];
      where.attendance_date = {
        lte: new Date(`${endDateStr}T23:59:59.999Z`),
      };
    } else if (filters?.month && filters?.year) {
      const m = Number(filters.month);
      const y = Number(filters.year);
      const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      where.attendance_date = {
        gte: start,
        lte: end,
      };
    } else if (filters?.attendance_date) {
      const dateStr = filters.attendance_date.split("T")[0];
      where.attendance_date = new Date(`${dateStr}T00:00:00.000Z`);
    }

    if (filters?.class_id) {
      where.schedule = {
        ...(where.schedule as Prisma.ScheduleWhereInput),
        classSubject: {
          class_id: filters.class_id,
          deleted_at: null,
          ...(institutionId
            ? { class: { institution_id: institutionId, deleted_at: null } }
            : {}),
        },
      };
    }

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { notes: { contains: term, mode: "insensitive" } },
        {
          student: {
            profile: {
              fullName: { contains: term, mode: "insensitive" },
            },
          },
        },
        {
          student: {
            studentNumber: { contains: term, mode: "insensitive" },
          },
        },
        {
          schedule: {
            classSubject: {
              subject: {
                name: { contains: term, mode: "insensitive" },
              },
            },
          },
        },
        {
          schedule: {
            classSubject: {
              class: {
                name: { contains: term, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    return where;
  }

  async create(data: CreateAttendanceInput): Promise<AttendanceEntity> {
    return this.prisma.attendances.create({
      data: {
        schedule_id: data.schedule_id,
        student_id: data.student_id,
        attendance_status_id: data.attendance_status_id,
        attendance_date: data.attendance_date ?? null,
        notes: data.notes ?? null,
      },
      select: attendanceSelect,
    });
  }

  async upsert(data: UpsertAttendanceInput): Promise<AttendanceEntity> {
    return this.prisma.attendances.upsert({
      where: {
        schedule_id_student_id_attendance_date: {
          schedule_id: data.schedule_id,
          student_id: data.student_id,
          attendance_date: data.attendance_date,
        },
      },
      create: {
        schedule_id: data.schedule_id,
        student_id: data.student_id,
        attendance_status_id: data.attendance_status_id,
        attendance_date: data.attendance_date,
        notes: data.notes ?? null,
      },
      update: {
        attendance_status_id: data.attendance_status_id,
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        deleted_at: null,
      },
      select: attendanceSelect,
    }) as unknown as Promise<AttendanceEntity>;
  }

  async bulkUpsert(
    records: UpsertAttendanceInput[],
  ): Promise<AttendanceEntity[]> {
    return this.prisma.$transaction(
      records.map((item) =>
        this.prisma.attendances.upsert({
          where: {
            schedule_id_student_id_attendance_date: {
              schedule_id: item.schedule_id,
              student_id: item.student_id,
              attendance_date: item.attendance_date,
            },
          },
          create: {
            schedule_id: item.schedule_id,
            student_id: item.student_id,
            attendance_status_id: item.attendance_status_id,
            attendance_date: item.attendance_date,
            notes: item.notes ?? null,
          },
          update: {
            attendance_status_id: item.attendance_status_id,
            ...(item.notes !== undefined ? { notes: item.notes } : {}),
            deleted_at: null,
          },
          select: attendanceSelect,
        }),
      ),
    ) as unknown as Promise<AttendanceEntity[]>;
  }

  async findById(
    id: string,
    institutionId?: string,
  ): Promise<AttendanceEntity | null> {
    return this.prisma.attendances.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institutionId
          ? {
              schedule: {
                classSubject: {
                  class: {
                    institution_id: institutionId,
                    deleted_at: null,
                  },
                },
              },
            }
          : {}),
      },
      select: attendanceSelect,
    });
  }

  async findBySchedule(
    schedule_id: string,
    institutionId?: string,
  ): Promise<AttendanceEntity[]> {
    return this.prisma.attendances.findMany({
      where: {
        schedule_id,
        deleted_at: null,
        ...(institutionId
          ? {
              schedule: {
                classSubject: {
                  class: {
                    institution_id: institutionId,
                    deleted_at: null,
                  },
                },
              },
            }
          : {}),
      },
      select: attendanceSelect,
    });
  }

  async findByStudent(
    student_id: string,
    institutionId?: string,
  ): Promise<AttendanceEntity[]> {
    return this.prisma.attendances.findMany({
      where: {
        student_id,
        deleted_at: null,
        ...(institutionId
          ? {
              student: {
                profile: {
                  institutionId,
                  deletedAt: null,
                },
              },
            }
          : {}),
      },
      select: attendanceSelect,
    });
  }

  async findByScheduleAndStudent(
    schedule_id: string,
    student_id: string,
  ): Promise<AttendanceEntity[]> {
    return this.prisma.attendances.findMany({
      where: {
        schedule_id,
        student_id,
        deleted_at: null,
      },
      select: attendanceSelect,
    });
  }

  async findByScheduleStudentAndDate(
    schedule_id: string,
    student_id: string,
    attendance_date: Date,
  ): Promise<AttendanceEntity | null> {
    return this.prisma.attendances.findFirst({
      where: {
        schedule_id,
        student_id,
        attendance_date,
        deleted_at: null,
      },
      select: attendanceSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: AttendanceSearchInput,
    institutionId?: string,
  ): Promise<{ data: AttendanceEntity[]; meta: AttendancePaginationMeta }> {
    const skip = (page - 1) * limit;
    const where = this.buildWhere(filters, institutionId);

    const [data, totalData] = await Promise.all([
      this.prisma.attendances.findMany({
        where,
        skip,
        take: limit,
        select: attendanceSelect,
        orderBy: [{ attendance_date: "asc" }, { created_at: "desc" }],
      }),
      this.prisma.attendances.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalData / limit);

    return {
      data,
      meta: {
        totalData,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    };
  }

  async getSummary(
    filters?: AttendanceSearchInput,
    institutionId?: string,
  ): Promise<AttendanceSummary> {
    const where = this.buildWhere(filters, institutionId);

    const records = await this.prisma.attendances.findMany({
      where,
      select: {
        attendance_status: {
          select: {
            name: true,
          },
        },
      },
    });

    let present = 0;
    let permission = 0;
    let sick = 0;
    let absent = 0;

    for (const record of records) {
      const name = record.attendance_status?.name?.toLowerCase().trim() ?? "";
      if (name.includes("hadir") || name === "present") {
        present++;
      } else if (name.includes("izin") || name.includes("permit")) {
        permission++;
      } else if (name.includes("sakit") || name.includes("sick")) {
        sick++;
      } else {
        absent++;
      }
    }

    const total = records.length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      permission,
      sick,
      absent,
      attendanceRate,
    };
  }

  async update(
    id: string,
    data: UpdateAttendanceInput,
  ): Promise<AttendanceEntity> {
    return this.prisma.attendances.update({
      where: { id },
      data: {
        ...(data.schedule_id !== undefined && {
          schedule_id: data.schedule_id,
        }),
        ...(data.student_id !== undefined && {
          student_id: data.student_id,
        }),
        ...(data.attendance_status_id !== undefined && {
          attendance_status_id: data.attendance_status_id,
        }),
        ...(data.attendance_date !== undefined && {
          attendance_date: data.attendance_date,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      },
      select: attendanceSelect,
    });
  }

  async delete(id: string): Promise<AttendanceEntity> {
    return this.prisma.attendances.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
      select: attendanceSelect,
    });
  }
}
