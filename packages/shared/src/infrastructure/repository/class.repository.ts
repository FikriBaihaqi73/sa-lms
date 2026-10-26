import type { Prisma, PrismaClient } from "#generated/client";
import { type ClassEntity, classSelect } from "#selects/class.select";

export interface CreateClassInput {
  institution_id: string;
  homeroom_teacher_id?: string;
  academic_year_id: string;
  name: string;
  grade_level: number;
  capacity?: number;
}

export interface UpdateClassInput {
  homeroom_teacher_id?: string | null;
  academic_year_id?: string;
  name?: string;
  grade_level?: number;
}

export interface FindAllClassInput {
  page?: number;
  limit?: number;
  search?: string;
  institution_id?: string;
}

export interface FindAllClassResult {
  data: ClassEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ClassRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateClassInput): Promise<ClassEntity> {
    return this.prisma.classes.create({
      data: {
        institution_id: data.institution_id,
        homeroom_teacher_id: data.homeroom_teacher_id ?? null,
        academic_year_id: data.academic_year_id,
        name: data.name,
        grade_level: data.grade_level,
        capacity: data.capacity ?? null,
      },
      select: classSelect,
    });
  }

  async findById(id: string, institution_id?: string): Promise<ClassEntity | null> {
    return this.prisma.classes.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institution_id !== undefined ? { institution_id } : {}),
      },
      select: classSelect,
    });
  }

  async findAll(params: FindAllClassInput = {}): Promise<FindAllClassResult> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const search = params.search?.trim();

    const where = {
      deleted_at: null,
      ...(params.institution_id !== undefined
        ? { institution_id: params.institution_id }
        : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                institution: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                homeroom_teacher: {
                  teacher_number: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                academic_year: {
                  academic_year: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
    } satisfies Prisma.ClassesWhereInput;

    const [data, total] = await Promise.all([
      this.prisma.classes.findMany({
        where,
        select: classSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      this.prisma.classes.count({ where }),
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

  async update(id: string, data: UpdateClassInput): Promise<ClassEntity> {
    return this.prisma.classes.update({
      where: { id },
      data: {
        ...(data.homeroom_teacher_id !== undefined && {
          homeroom_teacher_id: data.homeroom_teacher_id,
        }),
        ...(data.academic_year_id !== undefined && {
          academic_year_id: data.academic_year_id,
        }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.grade_level !== undefined && {
          grade_level: data.grade_level,
        }),
      },
      select: classSelect,
    });
  }

  async delete(id: string): Promise<ClassEntity> {
    return this.prisma.classes.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
      select: classSelect,
    });
  }
}
