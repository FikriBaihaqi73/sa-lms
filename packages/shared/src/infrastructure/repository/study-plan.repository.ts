import type { Prisma, PrismaClient } from "#generated/client";
import {
  type StudyPlanEntity,
  studyPlanSelect,
} from "#selects/study-plan.select";

export interface CreateStudyPlanInput {
  student_id: string;
  class_subject_id: string;
  academic_year_id: string;
}

export interface UpdateStudyPlanInput {
  student_id?: string | undefined;
  class_subject_id?: string | undefined;
  academic_year_id?: string | undefined;
}

export interface StudyPlanSearchInput {
  search?: string | undefined;
  student_id?: string | undefined;
  class_subject_id?: string | undefined;
  academic_year_id?: string | undefined;
  department_id?: string | undefined;
}

export class StudyPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateStudyPlanInput): Promise<StudyPlanEntity> {
    return this.prisma.studyPlans.create({
      data: {
        student_id: data.student_id,
        class_subject_id: data.class_subject_id,
        academic_year_id: data.academic_year_id,
      },
      select: studyPlanSelect,
    });
  }

  async findById(id: string): Promise<StudyPlanEntity | null> {
    return this.prisma.studyPlans.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: studyPlanSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: StudyPlanSearchInput,
  ): Promise<{
    data: StudyPlanEntity[];
    meta: {
      totalData: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const where = {
      deleted_at: null,
      ...(filters?.search
        ? {
            OR: [
              {
                student: {
                  is: {
                    studentNumber: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                student: {
                  is: {
                    profile: {
                      is: {
                        fullName: {
                          contains: filters.search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
              {
                classSubject: {
                  is: {
                    subject: {
                      is: {
                        name: {
                          contains: filters.search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
              {
                classSubject: {
                  is: {
                    subject: {
                      is: {
                        code: {
                          contains: filters.search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
              {
                academicYear: {
                  is: {
                    academic_year: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
      ...(filters?.student_id ? { student_id: filters.student_id } : {}),
      ...(filters?.class_subject_id
        ? { class_subject_id: filters.class_subject_id }
        : {}),
      ...(filters?.academic_year_id
        ? { academic_year_id: filters.academic_year_id }
        : {}),
      ...(filters?.department_id
        ? {
            classSubject: {
              is: {
                subject: {
                  is: {
                    departmentId: filters.department_id,
                  },
                },
              },
            },
          }
        : {}),
    } satisfies Prisma.StudyPlansWhereInput;

    const [data, totalData] = await Promise.all([
      this.prisma.studyPlans.findMany({
        where,
        skip,
        take: limit,
        select: studyPlanSelect,
        orderBy: {
          created_at: "desc",
        },
      }),
      this.prisma.studyPlans.count({
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

  async findByStudentClassSubjectAndAcademicYear(
    student_id: string,
    class_subject_id: string,
    academic_year_id: string,
  ): Promise<StudyPlanEntity | null> {
    return this.prisma.studyPlans.findFirst({
      where: {
        student_id,
        class_subject_id,
        academic_year_id,
        deleted_at: null,
      },
      select: studyPlanSelect,
    });
  }

  async update(
    id: string,
    data: UpdateStudyPlanInput,
  ): Promise<StudyPlanEntity> {
    return this.prisma.studyPlans.update({
      where: {
        id,
      },
      data: {
        ...(data.student_id !== undefined && {
          student_id: data.student_id,
        }),
        ...(data.class_subject_id !== undefined && {
          class_subject_id: data.class_subject_id,
        }),
        ...(data.academic_year_id !== undefined && {
          academic_year_id: data.academic_year_id,
        }),
      },
      select: studyPlanSelect,
    });
  }

  async delete(id: string): Promise<StudyPlanEntity> {
    return this.prisma.studyPlans.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
      select: studyPlanSelect,
    });
  }
}
