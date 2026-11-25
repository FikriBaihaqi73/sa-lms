import type { Prisma, PrismaClient } from "#generated/client";
import {
  type StudyResultEntity,
  studyResultSelect,
} from "#selects/study-result.select";

export interface CreateStudyResultInput {
  studentId: string;
  academicYearId: string;
  semesterId: string;
  totalCredits?: number | null | undefined;
  semesterGpa?: number | null | undefined;
  cumulativeGpa?: number | null | undefined;
  academicStatusId?: string | null | undefined;
}

export interface UpdateStudyResultInput {
  studentId?: string | undefined;
  academicYearId?: string | undefined;
  semesterId?: string | undefined;
  totalCredits?: number | null | undefined;
  semesterGpa?: number | null | undefined;
  cumulativeGpa?: number | null | undefined;
  academicStatusId?: string | null | undefined;
}

export interface StudyResultSearchInput {
  search?: string | undefined;
}

export interface StudyResultPaginationResult {
  data: StudyResultEntity[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export class StudyResultRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateStudyResultInput): Promise<StudyResultEntity> {
    return this.prisma.studyResult.create({
      data: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        semesterId: data.semesterId,
        totalCredits: data.totalCredits ?? null,
        semesterGpa: data.semesterGpa ?? null,
        cumulativeGpa: data.cumulativeGpa ?? null,
        academicStatusId: data.academicStatusId ?? null,
      },
      select: studyResultSelect,
    });
  }

  async findById(id: string): Promise<StudyResultEntity | null> {
    return this.prisma.studyResult.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: studyResultSelect,
    });
  }

  async findByStudentId(studentId: string): Promise<StudyResultEntity[]> {
    return this.prisma.studyResult.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      select: studyResultSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByAcademicYearId(
    academicYearId: string,
  ): Promise<StudyResultEntity[]> {
    return this.prisma.studyResult.findMany({
      where: {
        academicYearId,
        deletedAt: null,
      },
      select: studyResultSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findBySemesterId(semesterId: string): Promise<StudyResultEntity[]> {
    return this.prisma.studyResult.findMany({
      where: {
        semesterId,
        deletedAt: null,
      },
      select: studyResultSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByUniqueCombination(
    studentId: string,
    academicYearId: string,
    semesterId: string,
  ): Promise<StudyResultEntity | null> {
    return this.prisma.studyResult.findFirst({
      where: {
        studentId,
        academicYearId,
        semesterId,
        deletedAt: null,
      },
      select: studyResultSelect,
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: StudyResultSearchInput,
  ): Promise<StudyResultPaginationResult> {
    const skip = (page - 1) * limit;
    const search = filters?.search?.trim();

    const where: Prisma.StudyResultWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              {
                student: {
                  studentNumber: { contains: search, mode: "insensitive" },
                },
              },
              {
                student: {
                  profile: {
                    fullName: { contains: search, mode: "insensitive" },
                  },
                },
              },
              {
                academicYear: {
                  academic_year: { contains: search, mode: "insensitive" },
                },
              },
              {
                semester: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
              {
                academicStatus: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.studyResult.findMany({
        where,
        skip,
        take: limit,
        select: studyResultSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.studyResult.count({
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

  async update(
    id: string,
    data: UpdateStudyResultInput,
  ): Promise<StudyResultEntity> {
    return this.prisma.studyResult.update({
      where: {
        id,
      },
      data: {
        ...(data.studentId !== undefined && {
          studentId: data.studentId,
        }),
        ...(data.academicYearId !== undefined && {
          academicYearId: data.academicYearId,
        }),
        ...(data.semesterId !== undefined && {
          semesterId: data.semesterId,
        }),
        ...(data.totalCredits !== undefined && {
          totalCredits: data.totalCredits,
        }),
        ...(data.semesterGpa !== undefined && {
          semesterGpa: data.semesterGpa,
        }),
        ...(data.cumulativeGpa !== undefined && {
          cumulativeGpa: data.cumulativeGpa,
        }),
        ...(data.academicStatusId !== undefined && {
          academicStatusId: data.academicStatusId,
        }),
      },
      select: studyResultSelect,
    });
  }

  async delete(id: string): Promise<StudyResultEntity> {
    return this.prisma.studyResult.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: studyResultSelect,
    });
  }
}
