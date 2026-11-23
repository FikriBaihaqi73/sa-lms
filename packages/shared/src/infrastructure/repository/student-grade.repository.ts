import type { Prisma, PrismaClient } from "#generated/client";
import {
  type StudentGradeEntity,
  studentGradeSelect,
} from "#selects/student-grade.select";

export interface CreateStudentGradeInput {
  studentId: string;
  classSubjectId: string;
  academicYearId: string;
  institutionId: string;
  assignmentScore?: number | null | undefined;
  quizScore?: number | null | undefined;
  midExamScore?: number | null | undefined;
  finalExamScore?: number | null | undefined;
  finalScore?: number | null | undefined;
  gradeId?: string | null | undefined;
  remarks?: string | null | undefined;
}
export interface UpdateStudentGradeInput {
  assignmentScore?: number | null | undefined;
  quizScore?: number | null | undefined;
  midExamScore?: number | null | undefined;
  finalExamScore?: number | null | undefined;
  finalScore?: number | null | undefined;
  gradeId?: string | null | undefined;
  remarks?: string | null | undefined;
}
export interface StudentGradeSearchInput {
  search?: string;
  classSubjectId?: string;
  academicYearId?: string;
  studentId?: string;
  institutionId: string;
}
export interface StudentGradePaginationResult {
  data: StudentGradeResponse[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}
export interface StudentGradeStats {
  total: number;
  complete: number;
  incomplete: number;
  averageFinalScore: number | null;
}
export type StudentGradeResponse = Omit<
  StudentGradeEntity,
  | "assignmentScore"
  | "quizScore"
  | "midExamScore"
  | "finalExamScore"
  | "finalScore"
> & {
  assignmentScore: number | null;
  quizScore: number | null;
  midExamScore: number | null;
  finalExamScore: number | null;
  finalScore: number | null;
};

export class StudentGradeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateStudentGradeInput): Promise<StudentGradeResponse> {
    await this.assertScope(data.classSubjectId, data.institutionId);
    const result = await this.prisma.studentGrades.create({
      data: {
        studentId: data.studentId,
        classSubjectId: data.classSubjectId,
        academicYearId: data.academicYearId,
        ...(data.assignmentScore !== undefined
          ? { assignmentScore: data.assignmentScore }
          : {}),
        ...(data.quizScore !== undefined ? { quizScore: data.quizScore } : {}),
        ...(data.midExamScore !== undefined
          ? { midExamScore: data.midExamScore }
          : {}),
        ...(data.finalExamScore !== undefined
          ? { finalExamScore: data.finalExamScore }
          : {}),
        ...(data.finalScore !== undefined
          ? { finalScore: data.finalScore }
          : {}),
        ...(data.gradeId !== undefined ? { gradeId: data.gradeId } : {}),
        ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
      },
      select: studentGradeSelect,
    });
    return this.toResponse(result as StudentGradeEntity);
  }

  async findById(
    id: string,
    institutionId: string,
  ): Promise<StudentGradeResponse | null> {
    const result = await this.prisma.studentGrades.findFirst({
      where: this.scope({ id, deletedAt: null }, institutionId),
      select: studentGradeSelect,
    });
    return result ? this.toResponse(result as StudentGradeEntity) : null;
  }
  async findByStudentId(studentId: string, institutionId: string) {
    return this.findMany({ studentId, institutionId });
  }
  async findByClassSubjectId(classSubjectId: string, institutionId: string) {
    return this.findMany({ classSubjectId, institutionId });
  }
  async findByAcademicYearId(academicYearId: string, institutionId: string) {
    return this.findMany({ academicYearId, institutionId });
  }
  async findByUniqueCombination(
    studentId: string,
    classSubjectId: string,
    academicYearId: string,
    institutionId: string,
  ) {
    const result = await this.prisma.studentGrades.findFirst({
      where: this.scope(
        { studentId, classSubjectId, academicYearId, deletedAt: null },
        institutionId,
      ),
      select: studentGradeSelect,
    });
    return result ? this.toResponse(result as StudentGradeEntity) : null;
  }

  async findAll(
    page = 1,
    limit = 10,
    filters: StudentGradeSearchInput,
  ): Promise<StudentGradePaginationResult> {
    const currentPage = Math.max(Math.floor(page || 1), 1);
    const perPage = Math.min(Math.max(Math.floor(limit || 10), 1), 100);
    const search = filters.search?.trim();
    const where = this.scope(
      {
        deletedAt: null,
        ...(filters.classSubjectId
          ? { classSubjectId: filters.classSubjectId }
          : {}),
        ...(filters.academicYearId
          ? { academicYearId: filters.academicYearId }
          : {}),
        ...(filters.studentId ? { studentId: filters.studentId } : {}),
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
                  classSubject: {
                    subject: {
                      name: { contains: search, mode: "insensitive" },
                    },
                  },
                },
                {
                  classSubject: {
                    class: { name: { contains: search, mode: "insensitive" } },
                  },
                },
                {
                  academicYear: {
                    academic_year: { contains: search, mode: "insensitive" },
                  },
                },
                { grade: { grade: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      filters.institutionId,
    );
    const [data, totalData] = await Promise.all([
      this.prisma.studentGrades.findMany({
        where,
        skip: (currentPage - 1) * perPage,
        take: perPage,
        select: studentGradeSelect,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.studentGrades.count({ where }),
    ]);
    return {
      data: data.map((item) => this.toResponse(item as StudentGradeEntity)),
      meta: {
        totalData,
        totalPages: Math.ceil(totalData / perPage),
        currentPage,
        perPage,
      },
    };
  }

  async stats(institutionId: string): Promise<StudentGradeStats> {
    const where = this.scope({ deletedAt: null }, institutionId);
    const [total, incomplete, average] = await Promise.all([
      this.prisma.studentGrades.count({ where }),
      this.prisma.studentGrades.count({
        where: { ...where, finalScore: null },
      }),
      this.prisma.studentGrades.aggregate({
        where,
        _avg: { finalScore: true },
      }),
    ]);
    return {
      total,
      complete: total - incomplete,
      incomplete,
      averageFinalScore:
        average._avg.finalScore == null
          ? null
          : Number(average._avg.finalScore),
    };
  }

  async update(
    id: string,
    institutionId: string,
    data: UpdateStudentGradeInput,
  ): Promise<StudentGradeResponse> {
    const result = await this.prisma.studentGrades.updateMany({
      where: this.scope({ id, deletedAt: null }, institutionId),
      data: {
        ...(data.assignmentScore !== undefined
          ? { assignmentScore: data.assignmentScore }
          : {}),
        ...(data.quizScore !== undefined ? { quizScore: data.quizScore } : {}),
        ...(data.midExamScore !== undefined
          ? { midExamScore: data.midExamScore }
          : {}),
        ...(data.finalExamScore !== undefined
          ? { finalExamScore: data.finalExamScore }
          : {}),
        ...(data.finalScore !== undefined
          ? { finalScore: data.finalScore }
          : {}),
        ...(data.gradeId !== undefined ? { gradeId: data.gradeId } : {}),
        ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
      },
    });
    if (result.count === 0) throw new Error("Student grade not found");
    const updated = await this.findById(id, institutionId);
    if (!updated) throw new Error("Student grade not found");
    return updated;
  }
  async delete(
    id: string,
    institutionId: string,
  ): Promise<StudentGradeResponse> {
    const result = await this.prisma.studentGrades.updateMany({
      where: this.scope({ id, deletedAt: null }, institutionId),
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) throw new Error("Student grade not found");
    const deleted = await this.prisma.studentGrades.findFirst({
      where: { id },
      select: studentGradeSelect,
    });
    if (!deleted) throw new Error("Student grade not found");
    return this.toResponse(deleted as StudentGradeEntity);
  }

  private async findMany(filters: {
    studentId?: string;
    classSubjectId?: string;
    academicYearId?: string;
    institutionId: string;
  }): Promise<StudentGradeResponse[]> {
    const data = await this.prisma.studentGrades.findMany({
      where: this.scope(
        {
          ...(filters.studentId ? { studentId: filters.studentId } : {}),
          ...(filters.classSubjectId
            ? { classSubjectId: filters.classSubjectId }
            : {}),
          ...(filters.academicYearId
            ? { academicYearId: filters.academicYearId }
            : {}),
          deletedAt: null,
        },
        filters.institutionId,
      ),
      select: studentGradeSelect,
      orderBy: { createdAt: "desc" },
    });
    return data.map((item) => this.toResponse(item as StudentGradeEntity));
  }
  private async assertScope(classSubjectId: string, institutionId: string) {
    const relation = await this.prisma.classSubjects.findFirst({
      where: {
        id: classSubjectId,
        deleted_at: null,
        class: { institution_id: institutionId },
      },
      select: { id: true },
    });
    if (!relation)
      throw new Error("Student grade is outside institution scope");
  }
  private scope(
    where: Prisma.StudentGradesWhereInput,
    institutionId: string,
  ): Prisma.StudentGradesWhereInput {
    return {
      ...where,
      classSubject: { class: { institution_id: institutionId } },
    };
  }
  private toResponse(item: StudentGradeEntity): StudentGradeResponse {
    return {
      ...item,
      assignmentScore:
        item.assignmentScore == null ? null : Number(item.assignmentScore),
      quizScore: item.quizScore == null ? null : Number(item.quizScore),
      midExamScore:
        item.midExamScore == null ? null : Number(item.midExamScore),
      finalExamScore:
        item.finalExamScore == null ? null : Number(item.finalExamScore),
      finalScore: item.finalScore == null ? null : Number(item.finalScore),
    };
  }
}
