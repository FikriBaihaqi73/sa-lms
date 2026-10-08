import type { Prisma, PrismaClient } from "#generated/client";
import { type TeacherEntity, teacherSelect } from "#selects/teacher.select";

export interface CreateTeacherInput {
  profile_id: string;
  department_id?: string;
  specialization_id?: string;
  employment_status_id?: string;
  teacher_number: string;
  join_date?: Date;
}

export interface UpdateTeacherInput {
  profile_id?: string;
  department_id?: string;
  specialization_id?: string;
  employment_status_id?: string;
  teacher_number?: string;
  join_date?: Date;
}

export interface FindAllTeachersInput {
  page?: number;
  limit?: number;
  search?: string;
  employmentStatusId?: string;
  specializationId?: string;
}

export interface FindAllTeachersResult {
  data: TeacherEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TeacherStatsResult {
  total: number;
  tetapCount: number;
  honorerCount: number;
  specializationCount: number;
  totalClassAssignments: number;
  unassignedCount: number;
}

function normalizeStatusName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export class TeacherRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTeacherInput): Promise<TeacherEntity> {
    return this.prisma.teachers.create({
      data: {
        profile_id: data.profile_id,
        department_id: data.department_id ?? null,
        specialization_id: data.specialization_id ?? null,
        employment_status_id: data.employment_status_id ?? null,
        teacher_number: data.teacher_number,
        join_date: data.join_date ?? null,
      },
      select: teacherSelect,
    });
  }
  async findById(id: string): Promise<TeacherEntity | null> {
    return this.prisma.teachers.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: teacherSelect,
    });
  }

  async findByTeacherNumber(
    teacher_number: string,
  ): Promise<TeacherEntity | null> {
    return this.prisma.teachers.findFirst({
      where: {
        teacher_number,
        deleted_at: null,
      },
      select: teacherSelect,
    });
  }

  async findAll(params: FindAllTeachersInput = {}): Promise<FindAllTeachersResult> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const search = params.search?.trim();
    const employmentStatusId = params.employmentStatusId?.trim();
    const specializationId = params.specializationId?.trim();

    const where: Prisma.TeachersWhereInput = {
      deleted_at: null,
      ...(employmentStatusId ? { employment_status_id: employmentStatusId } : {}),
      ...(specializationId ? { specialization_id: specializationId } : {}),
      ...(search
        ? {
            OR: [
              { teacher_number: { contains: search, mode: "insensitive" } },
              {
                profile: {
                  fullName: { contains: search, mode: "insensitive" },
                },
              },
              {
                profile: {
                  email: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.teachers.findMany({
        where,
        select: teacherSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      this.prisma.teachers.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(): Promise<TeacherStatsResult> {
    const [total, teachers, specializationCount, totalClassAssignments, unassignedCount] =
      await Promise.all([
        this.prisma.teachers.count({ where: { deleted_at: null } }),
        this.prisma.teachers.findMany({
          where: { deleted_at: null },
          select: {
            employment_status: { select: { name: true } },
          },
        }),
        this.prisma.specializations.count({ where: { deleted_at: null } }),
        this.prisma.classSubjects.count({ where: { deleted_at: null } }),
        this.prisma.teachers.count({
          where: { deleted_at: null, classSubjects: { none: { deleted_at: null } } },
        }),
      ]);

    let tetapCount = 0;
    let honorerCount = 0;
    for (const teacher of teachers) {
      const status = normalizeStatusName(teacher.employment_status?.name);
      if (status.includes("tetap")) tetapCount += 1;
      else if (status.includes("honorer") || status.includes("kontrak")) honorerCount += 1;
    }

    return {
      total,
      tetapCount,
      honorerCount,
      specializationCount,
      totalClassAssignments,
      unassignedCount,
    };
  }

  async update(id: string, data: UpdateTeacherInput): Promise<TeacherEntity> {
    return this.prisma.teachers.update({
      where: { id },
      data: {
        ...(data.profile_id !== undefined && {
          profile_id: data.profile_id,
        }),
        ...(data.department_id !== undefined && {
          department_id: data.department_id,
        }),
        ...(data.specialization_id !== undefined && {
          specialization_id: data.specialization_id,
        }),
        ...(data.employment_status_id !== undefined && {
          employment_status_id: data.employment_status_id,
        }),
        ...(data.teacher_number !== undefined && {
          teacher_number: data.teacher_number,
        }),
        ...(data.join_date !== undefined && {
          join_date: data.join_date,
        }),
      },
      select: teacherSelect,
    });
  }

  async delete(id: string): Promise<TeacherEntity> {
    return this.prisma.teachers.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
      select: teacherSelect,
    });
  }
}
