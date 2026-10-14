import type { PrismaClient } from "#generated/client";
import { type StudentEntity, studentSelect } from "#selects/students.select";

export interface CreateStudentInput {
  profileId: string;
  departmentId?: string | null;
  academicStatusId: string;
  studentNumber: string;
  enrollmentYear?: number | null;
  referralCode?: string | null;
  referralExpiresAt?: Date | string | null;
}

export interface UpdateStudentInput {
  departmentId?: string | null;
  academicStatusId?: string;
  studentNumber?: string;
  enrollmentYear?: number | null;
  referralCode?: string | null;
  referralExpiresAt?: Date | string | null;
}

export interface FindAllStudentInput {
  page?: number;
  limit?: number;
  search?: string;
  institutionId?: string;
}

export interface FindAllStudentResult {
  data: StudentEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class StudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateStudentInput): Promise<StudentEntity> {
    return this.prisma.student.create({
      data: {
        profileId: data.profileId,
        departmentId: data.departmentId ?? null,
        academicStatusId: data.academicStatusId,
        studentNumber: data.studentNumber,
        enrollmentYear: data.enrollmentYear ?? null,
        referralCode: data.referralCode ? data.referralCode.trim() : null,
        referralExpiresAt: data.referralExpiresAt
          ? new Date(data.referralExpiresAt)
          : null,
      },
      select: studentSelect,
    });
  }

  async findById(id: string): Promise<StudentEntity | null> {
    return this.prisma.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: studentSelect,
    });
  }

  async findByStudentNumber(
    studentNumber: string,
  ): Promise<StudentEntity | null> {
    return this.prisma.student.findFirst({
      where: {
        studentNumber,
        deletedAt: null,
      },
      select: studentSelect,
    });
  }

  async findByProfileId(profileId: string): Promise<StudentEntity | null> {
    return this.prisma.student.findFirst({
      where: {
        profileId,
        deletedAt: null,
      },
      select: studentSelect,
    });
  }

  async findAll(
    params: FindAllStudentInput = {},
  ): Promise<FindAllStudentResult> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const search = params.search?.trim();

    const where = {
      deletedAt: null,
      ...(params.institutionId
        ? { profile: { institutionId: params.institutionId } }
        : {}),
      ...(search
        ? {
            OR: [
              {
                studentNumber: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                profile: {
                  fullName: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                profile: {
                  email: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                profile: {
                  identityNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                referralCode: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        select: studentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      this.prisma.student.count({
        where,
      }),
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

  async update(id: string, data: UpdateStudentInput): Promise<StudentEntity> {
    return this.prisma.student.update({
      where: {
        id,
      },
      data: {
        ...(data.departmentId !== undefined && {
          departmentId: data.departmentId,
        }),
        ...(data.academicStatusId !== undefined && {
          academicStatusId: data.academicStatusId,
        }),
        ...(data.studentNumber !== undefined && {
          studentNumber: data.studentNumber,
        }),
        ...(data.enrollmentYear !== undefined && {
          enrollmentYear: data.enrollmentYear,
        }),
        ...(data.referralCode !== undefined && {
          referralCode: data.referralCode ? data.referralCode.trim() : null,
        }),
        ...(data.referralExpiresAt !== undefined && {
          referralExpiresAt: data.referralExpiresAt
            ? new Date(data.referralExpiresAt)
            : null,
        }),
      },
      select: studentSelect,
    });
  }

  async delete(id: string): Promise<StudentEntity> {
    return this.prisma.student.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: studentSelect,
    });
  }
}
