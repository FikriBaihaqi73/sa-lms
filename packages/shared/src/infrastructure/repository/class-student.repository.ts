import type { PrismaClient } from "#generated/client";
import {
  type ClassStudentEntity,
  classStudentSelect,
} from "#selects/class-student.select";

export interface CreateClassStudentInput {
  classId: string;
  studentId: string;
}

export interface UpdateClassStudentInput {
  classId?: string;
  studentId?: string;
}

export interface FindAllClassStudentInput {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  status?: string;
}

export interface FindAllClassStudentResult {
  data: ClassStudentEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CandidateStudentEntity {
  id: string;
  studentNumber: string;
  fullName: string;
  isPreviouslyRemoved?: boolean;
  currentClassName?: string | null;
}

export class ClassStudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateClassStudentInput): Promise<ClassStudentEntity> {
    return this.prisma.classStudent.create({
      data: {
        classId: data.classId,
        studentId: data.studentId,
      },
      select: classStudentSelect,
    });
  }

  async findById(id: string): Promise<ClassStudentEntity | null> {
    return this.prisma.classStudent.findFirst({
      where: { id },
      select: classStudentSelect,
    });
  }

  async findByClassAndStudent(
    classId: string,
    studentId: string,
  ): Promise<ClassStudentEntity | null> {
    return this.prisma.classStudent.findFirst({
      where: {
        classId,
        studentId,
        deletedAt: null,
      },
      select: classStudentSelect,
    });
  }

  async findByClass(classId: string): Promise<ClassStudentEntity[]> {
    return this.prisma.classStudent.findMany({
      where: {
        classId,
        deletedAt: null,
      },
      select: classStudentSelect,
    });
  }

  async findByStudent(studentId: string): Promise<ClassStudentEntity[]> {
    return this.prisma.classStudent.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      select: classStudentSelect,
    });
  }

  async findAll(
    params: FindAllClassStudentInput = {},
  ): Promise<FindAllClassStudentResult> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const search = params.search?.trim();
    const isDeleted = params.status === "deleted";

    const where = {
      deletedAt: isDeleted ? { not: null } : null,
      ...(params.classId ? { classId: params.classId } : {}),
      ...(search
        ? {
            OR: [
              {
                classes: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                student: {
                  studentNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.classStudent.findMany({
        where,
        select: classStudentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.classStudent.count({ where }),
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

  async update(
    id: string,
    data: UpdateClassStudentInput,
  ): Promise<ClassStudentEntity> {
    return this.prisma.classStudent.update({
      where: {
        id,
      },
      data: {
        ...(data.classId !== undefined && { classId: data.classId }),
        ...(data.studentId !== undefined && { studentId: data.studentId }),
      },
      select: classStudentSelect,
    });
  }

  async delete(id: string): Promise<ClassStudentEntity> {
    return this.prisma.classStudent.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: classStudentSelect,
    });
  }

  async restore(id: string): Promise<ClassStudentEntity> {
    return this.prisma.classStudent.update({
      where: { id },
      data: { deletedAt: null },
      select: classStudentSelect,
    });
  }

  async getSummary(classId?: string): Promise<{
    totalActive: number;
    recentJoined: number;
    totalDeleted: number;
    filledClassesCount: number;
    totalClassesCount: number;
  }> {
    const classFilter = classId ? { classId } : {};
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalActive, recentJoined, totalDeleted, filledClassesRaw, totalClassesCount] =
      await Promise.all([
        this.prisma.classStudent.count({
          where: { ...classFilter, deletedAt: null },
        }),
        this.prisma.classStudent.count({
          where: {
            ...classFilter,
            deletedAt: null,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        this.prisma.classStudent.count({
          where: { ...classFilter, deletedAt: { not: null } },
        }),
        this.prisma.classStudent.groupBy({
          by: ["classId"],
          where: { deletedAt: null },
          _count: { classId: true },
        }),
        this.prisma.classes.count(),
      ]);

    return {
      totalActive,
      recentJoined,
      totalDeleted,
      filledClassesCount: filledClassesRaw.length,
      totalClassesCount,
    };
  }

  async findCandidates(classId: string): Promise<CandidateStudentEntity[]> {
    const targetClass = await this.prisma.classes.findFirst({
      where: { id: classId, deleted_at: null },
      select: { id: true, institution_id: true, name: true },
    });

    if (!targetClass) {
      return [];
    }

    // Auto-create Student records for any profiles with student role in this institution that don't have a Student record yet
    try {
      const orphanProfiles = await this.prisma.profile.findMany({
        where: {
          institutionId: targetClass.institution_id,
          deletedAt: null,
          role: {
            name: { in: ["student", "Student", "siswa", "Siswa"], mode: "insensitive" },
          },
          student: null,
        },
        select: {
          id: true,
          identityNumber: true,
        },
      });

      if (orphanProfiles.length > 0) {
        let defaultStatus = await this.prisma.academicStatuses.findFirst({
          where: {
            name: { in: ["Aktif", "aktif", "Active", "active"] },
            deleted_at: null,
          },
        });
        if (!defaultStatus) {
          defaultStatus = await this.prisma.academicStatuses.findFirst({
            where: { deleted_at: null },
          });
        }

        if (defaultStatus) {
          for (const op of orphanProfiles) {
            const sNum =
              op.identityNumber ||
              `STU-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
            try {
              await this.prisma.student.create({
                data: {
                  profileId: op.id,
                  academicStatusId: defaultStatus.id,
                  studentNumber: sNum,
                  enrollmentYear: new Date().getFullYear(),
                },
              });
            } catch {
              // ignore duplicate or concurrent insert
            }
          }
        }
      }
    } catch {
      // ignore orphan check failure if roles/statuses not configured
    }

    // Query active students belonging to the target class's institution
    const students = await this.prisma.student.findMany({
      where: {
        deletedAt: null,
        profile: {
          institutionId: targetClass.institution_id,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        studentNumber: true,
        profile: {
          select: {
            fullName: true,
          },
        },
        classStudents: {
          select: {
            id: true,
            classId: true,
            deletedAt: true,
            classes: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        studentNumber: "asc",
      },
    });

    const candidates: CandidateStudentEntity[] = [];

    for (const student of students) {
      const activeInThisClass = student.classStudents.some(
        (cs) => cs.classId === classId && cs.deletedAt === null,
      );
      if (activeInThisClass) {
        continue;
      }

      const isPreviouslyRemoved = student.classStudents.some(
        (cs) => cs.classId === classId && cs.deletedAt !== null,
      );

      const activeOtherClass = student.classStudents.find(
        (cs) => cs.classId !== classId && cs.deletedAt === null,
      );

      candidates.push({
        id: student.id,
        studentNumber: student.studentNumber,
        fullName: student.profile?.fullName || `Siswa #${student.studentNumber}`,
        isPreviouslyRemoved,
        currentClassName: activeOtherClass?.classes?.name ?? null,
      });
    }

    return candidates;
  }
}
