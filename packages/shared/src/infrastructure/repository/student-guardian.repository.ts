import type { PrismaClient } from "#generated/client";
import {
  type StudentGuardianEntity,
  studentGuardianSelect,
} from "#selects/student-guardian.select";

export interface CreateStudentGuardianInput {
  studentId: string;
  guardianId: string;
  isPrimary?: boolean;
}

export interface UpdateStudentGuardianInput {
  studentId?: string;
  guardianId?: string;
  isPrimary?: boolean;
}

export class StudentGuardianRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    data: CreateStudentGuardianInput,
  ): Promise<StudentGuardianEntity> {
    return this.prisma.studentGuardian.create({
      data: {
        studentId: data.studentId,
        guardianId: data.guardianId,
        isPrimary: data.isPrimary ?? false,
      },
      select: studentGuardianSelect,
    });
  }

  async findById(id: string, institutionId: string): Promise<StudentGuardianEntity | null> {
    return this.prisma.studentGuardian.findFirst({
      where: {
        id,
        deletedAt: null,
        student: { profile: { institutionId } },
      },
      select: studentGuardianSelect,
    });
  }

  async findByStudentAndGuardian(
    studentId: string,
    guardianId: string,
  ): Promise<StudentGuardianEntity | null> {
    return this.prisma.studentGuardian.findFirst({
      where: {
        studentId,
        guardianId,
        deletedAt: null,
      },
      select: studentGuardianSelect,
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string, institutionId?: string,
  ): Promise<{ data: StudentGuardianEntity[]; meta: any }> {
    const skip = (page - 1) * limit;
    const whereCondition = {
      deletedAt: null,
      ...(institutionId ? { student: { profile: { institutionId } } } : {}),
      ...(search
        ? {
            OR: [
              {
                student: {
                  studentNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                student: {
                  profile: {
                    fullName: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
              {
                guardian: {
                  fullName: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                guardian: {
                  email: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                guardian: {
                  phoneNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.studentGuardian.findMany({
        where: whereCondition,
        skip,
        take: limit,
        select: studentGuardianSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.studentGuardian.count({
        where: whereCondition,
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

  async findByStudentId(studentId: string, institutionId: string): Promise<StudentGuardianEntity[]> {
    return this.prisma.studentGuardian.findMany({
      where: {
        studentId,
        deletedAt: null,
        student: { profile: { institutionId } },
      },
      select: studentGuardianSelect,
    });
  }

  async findByGuardianId(guardianId: string, institutionId: string): Promise<StudentGuardianEntity[]> {
    return this.prisma.studentGuardian.findMany({
      where: {
        guardianId,
        deletedAt: null,
        student: { profile: { institutionId } },
      },
      select: studentGuardianSelect,
    });
  }

  async update(
    id: string,
    data: UpdateStudentGuardianInput,
  ): Promise<StudentGuardianEntity> {
    return this.prisma.studentGuardian.update({
      where: {
        id,
      },
      data: {
        ...(data.studentId !== undefined && {
          studentId: data.studentId,
        }),
        ...(data.guardianId !== undefined && {
          guardianId: data.guardianId,
        }),
        ...(data.isPrimary !== undefined && {
          isPrimary: data.isPrimary,
        }),
      },
      select: studentGuardianSelect,
    });
  }

  async delete(id: string): Promise<StudentGuardianEntity> {
    return this.prisma.studentGuardian.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: studentGuardianSelect,
    });
  }
}
