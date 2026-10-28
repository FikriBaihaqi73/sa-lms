import type { Prisma, PrismaClient } from "#generated/client";
import {
  type ClassSubjectsEntity,
  classSubjectsSelect,
} from "#selects/class-subjects.select";

export interface CreateClassSubjectsInput {
  class_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year_id: string;
}

export interface UpdateClassSubjectsInput {
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
  academic_year_id?: string;
}

export interface ClassSubjectsSearchInput {
  search?: string | undefined;
  class_id?: string | undefined;
  academic_year_id?: string | undefined;
  teacher_id?: string | undefined;
  institution_id?: string | undefined;
}

export interface ClassSubjectsUsage {
  schedules: number;
  modules: number;
  examinations: number;
  studentGrades: number;
}

export interface ClassSubjectsPaginationResult {
  data: ClassSubjectsEntity[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export class ClassSubjectsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateClassSubjectsInput): Promise<ClassSubjectsEntity> {
    return this.prisma.classSubjects.create({
      data: {
        class_id: data.class_id,
        subject_id: data.subject_id,
        teacher_id: data.teacher_id,
        academic_year_id: data.academic_year_id,
      },
      select: classSubjectsSelect,
    });
  }

  async findById(
    id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity | null> {
    return this.prisma.classSubjects.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institution_id !== undefined ? { class: { institution_id } } : {}),
      },
      select: classSubjectsSelect,
    });
  }

  async findByClass(
    class_id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity[]> {
    return this.prisma.classSubjects.findMany({
      where: {
        class_id,
        deleted_at: null,
        ...(institution_id !== undefined ? { class: { institution_id } } : {}),
      },
      select: classSubjectsSelect,
    });
  }

  async findBySubject(
    subject_id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity[]> {
    return this.prisma.classSubjects.findMany({
      where: {
        subject_id,
        deleted_at: null,
        ...(institution_id !== undefined ? { class: { institution_id } } : {}),
      },
      select: classSubjectsSelect,
    });
  }

  async findByTeacher(
    teacher_id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity[]> {
    return this.prisma.classSubjects.findMany({
      where: {
        teacher_id,
        deleted_at: null,
        ...(institution_id !== undefined ? { class: { institution_id } } : {}),
      },
      select: classSubjectsSelect,
    });
  }

  async findByAcademicYear(
    academic_year_id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity[]> {
    return this.prisma.classSubjects.findMany({
      where: {
        academic_year_id,
        deleted_at: null,
        ...(institution_id !== undefined ? { class: { institution_id } } : {}),
      },
      select: classSubjectsSelect,
    });
  }

  async findByUniqueCombination(
    class_id: string,
    subject_id: string,
    academic_year_id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity | null> {
    return this.prisma.classSubjects.findFirst({
      where: {
        class_id,
        subject_id,
        academic_year_id,
        deleted_at: null,
        ...(institution_id !== undefined ? { class: { institution_id } } : {}),
      },
      select: classSubjectsSelect,
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: ClassSubjectsSearchInput,
  ): Promise<ClassSubjectsPaginationResult> {
    const skip = (page - 1) * limit;
    const search = filters?.search?.trim();

    const where: Prisma.ClassSubjectsWhereInput = {
      deleted_at: null,
      ...(filters?.institution_id !== undefined
        ? { class: { institution_id: filters.institution_id } }
        : {}),
      ...(filters?.class_id !== undefined
        ? { class_id: filters.class_id }
        : {}),
      ...(filters?.academic_year_id !== undefined
        ? { academic_year_id: filters.academic_year_id }
        : {}),
      ...(filters?.teacher_id !== undefined
        ? { teacher_id: filters.teacher_id }
        : {}),
      ...(search
        ? {
            OR: [
              { class: { name: { contains: search, mode: "insensitive" } } },
              { subject: { name: { contains: search, mode: "insensitive" } } },
              { subject: { code: { contains: search, mode: "insensitive" } } },
              {
                teacher: {
                  teacher_number: { contains: search, mode: "insensitive" },
                },
              },
              {
                teacher: {
                  profile: {
                    fullName: { contains: search, mode: "insensitive" },
                  },
                },
              },
              {
                academic_year: {
                  academic_year: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.classSubjects.findMany({
        where,
        skip,
        take: limit,
        select: classSubjectsSelect,
        orderBy: {
          created_at: "desc",
        },
      }),
      this.prisma.classSubjects.count({
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
    data: UpdateClassSubjectsInput,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity> {
    const current = await this.findById(id, institution_id);
    if (!current) {
      throw new Error("Class subject relation not found");
    }
    return this.prisma.classSubjects.update({
      where: { id },
      data: {
        ...(data.class_id !== undefined && { class_id: data.class_id }),
        ...(data.subject_id !== undefined && { subject_id: data.subject_id }),
        ...(data.teacher_id !== undefined && { teacher_id: data.teacher_id }),
        ...(data.academic_year_id !== undefined && {
          academic_year_id: data.academic_year_id,
        }),
      },
      select: classSubjectsSelect,
    });
  }

  async findUsage(
    id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsUsage> {
    const record = await this.prisma.classSubjects.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institution_id !== undefined ? { class: { institution_id } } : {}),
      },
      select: { id: true },
    });
    if (!record) {
      return { schedules: 0, modules: 0, examinations: 0, studentGrades: 0 };
    }

    const [schedules, modules, examinations, studentGrades] = await Promise.all(
      [
        this.prisma.schedule.count({
          where: { classSubjectId: id, deletedAt: null },
        }),
        this.prisma.modules.count({
          where: { class_subject_id: id, deleted_at: null },
        }),
        this.prisma.examinations.count({
          where: { classSubjectId: id, deletedAt: null },
        }),
        this.prisma.studentGrades.count({
          where: { classSubjectId: id, deletedAt: null },
        }),
      ],
    );
    return { schedules, modules, examinations, studentGrades };
  }

  async delete(
    id: string,
    institution_id?: string,
  ): Promise<ClassSubjectsEntity> {
    const current = await this.findById(id, institution_id);
    if (!current) {
      throw new Error("Class subject relation not found");
    }
    return this.prisma.classSubjects.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
      select: classSubjectsSelect,
    });
  }
}
