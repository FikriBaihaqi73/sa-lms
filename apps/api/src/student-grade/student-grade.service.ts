import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { StudentGradeRepository } from "@repo/shared/infrastructure/repository/student-grade.repository";
import type {
  CreateStudentGradeDto,
  StudentGradeQueryDto,
  UpdateStudentGradeDto,
} from "@repo/shared/schemas/student-grade.schema";
import { PrismaService } from "../prisma/prisma.service";

interface StudentGradeUser {
  sub: string;
}
function prismaCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error))
    return null;
  const code = error.code;
  return typeof code === "string" ? code : null;
}

@Injectable()
export class StudentGradeService {
  private readonly repository: StudentGradeRepository;
  constructor(private readonly prisma: PrismaService) {
    this.repository = new StudentGradeRepository(this.prisma.client);
  }

  async findAll(query: StudentGradeQueryDto, user: StudentGradeUser) {
    return this.repository.findAll(query.page, query.limit, {
      institutionId: await this.institutionIdFor(user.sub),
      ...(query.search !== undefined ? { search: query.search } : {}),
      ...(query.classSubjectId !== undefined
        ? { classSubjectId: query.classSubjectId }
        : {}),
      ...(query.academicYearId !== undefined
        ? { academicYearId: query.academicYearId }
        : {}),
      ...(query.studentId !== undefined ? { studentId: query.studentId } : {}),
    });
  }
  async stats(user: StudentGradeUser) {
    return this.repository.stats(await this.institutionIdFor(user.sub));
  }
  async findOne(id: string, user: StudentGradeUser) {
    const record = await this.repository.findById(
      id,
      await this.institutionIdFor(user.sub),
    );
    if (!record) throw new NotFoundException("Nilai siswa tidak ditemukan.");
    return record;
  }
  async findByStudentId(studentId: string, user: StudentGradeUser) {
    const institutionId = await this.institutionIdFor(user.sub);
    const student = await this.prisma.client.student.findFirst({
      where: { id: studentId, deletedAt: null, profile: { institutionId } },
      select: { id: true },
    });
    if (!student) throw new NotFoundException("Siswa tidak ditemukan.");
    return this.repository.findByStudentId(studentId, institutionId);
  }
  async findByClassSubjectId(classSubjectId: string, user: StudentGradeUser) {
    const institutionId = await this.institutionIdFor(user.sub);
    await this.requireClassSubject(classSubjectId, institutionId);
    return this.repository.findByClassSubjectId(classSubjectId, institutionId);
  }
  async findByAcademicYearId(academicYearId: string, user: StudentGradeUser) {
    const institutionId = await this.institutionIdFor(user.sub);
    await this.requireAcademicYear(academicYearId, institutionId);
    return this.repository.findByAcademicYearId(academicYearId, institutionId);
  }
  async create(dto: CreateStudentGradeDto, user: StudentGradeUser) {
    const institutionId = await this.institutionIdFor(user.sub);
    await this.validateRelations(dto, institutionId);
    const existing = await this.repository.findByUniqueCombination(
      dto.studentId,
      dto.classSubjectId,
      dto.academicYearId,
      institutionId,
    );
    if (existing)
      throw new ConflictException(
        "Nilai untuk siswa, mata pelajaran kelas, dan tahun ajaran ini sudah ada.",
      );
    try {
      return await this.repository.create({ ...dto, institutionId });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
  async update(id: string, dto: UpdateStudentGradeDto, user: StudentGradeUser) {
    const institutionId = await this.institutionIdFor(user.sub);
    if (!(await this.repository.findById(id, institutionId)))
      throw new NotFoundException("Nilai siswa tidak ditemukan.");
    if (dto.gradeId !== undefined && dto.gradeId !== null)
      await this.requireGrade(dto.gradeId);
    try {
      return await this.repository.update(id, institutionId, dto);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
  async remove(id: string, user: StudentGradeUser) {
    const institutionId = await this.institutionIdFor(user.sub);
    if (!(await this.repository.findById(id, institutionId)))
      throw new NotFoundException("Nilai siswa tidak ditemukan.");
    try {
      await this.repository.delete(id, institutionId);
      return { success: true, id };
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile?.institutionId)
      throw new ForbiddenException("Akun tidak memiliki institusi.");
    return profile.institutionId;
  }
  private async validateRelations(
    dto: CreateStudentGradeDto,
    institutionId: string,
  ) {
    const [student, classSubject, academicYear] = await Promise.all([
      this.prisma.client.student.findFirst({
        where: {
          id: dto.studentId,
          deletedAt: null,
          profile: { institutionId },
        },
        select: { id: true },
      }),
      this.prisma.client.classSubjects.findFirst({
        where: {
          id: dto.classSubjectId,
          deleted_at: null,
          class: { institution_id: institutionId },
        },
        select: { id: true, academic_year_id: true },
      }),
      this.prisma.client.academicYears.findFirst({
        where: {
          id: dto.academicYearId,
          deleted_at: null,
          institution_id: institutionId,
        },
        select: { id: true },
      }),
    ]);
    if (!student) throw new NotFoundException("Siswa tidak ditemukan.");
    if (!classSubject)
      throw new NotFoundException("Mata pelajaran kelas tidak ditemukan.");
    if (!academicYear)
      throw new NotFoundException("Tahun ajaran tidak ditemukan.");
    if (classSubject.academic_year_id !== dto.academicYearId)
      throw new NotFoundException(
        "Tahun ajaran mata pelajaran kelas tidak sesuai.",
      );
    if (dto.gradeId !== undefined && dto.gradeId !== null)
      await this.requireGrade(dto.gradeId);
  }
  private async requireClassSubject(id: string, institutionId: string) {
    const result = await this.prisma.client.classSubjects.findFirst({
      where: { id, deleted_at: null, class: { institution_id: institutionId } },
      select: { id: true },
    });
    if (!result)
      throw new NotFoundException("Mata pelajaran kelas tidak ditemukan.");
  }
  private async requireAcademicYear(id: string, institutionId: string) {
    const result = await this.prisma.client.academicYears.findFirst({
      where: { id, deleted_at: null, institution_id: institutionId },
      select: { id: true },
    });
    if (!result) throw new NotFoundException("Tahun ajaran tidak ditemukan.");
  }
  private async requireGrade(id: string) {
    const result = await this.prisma.client.grades.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!result) throw new NotFoundException("Huruf mutu tidak ditemukan.");
  }
  private mapPrismaError(error: unknown): Error {
    const code = prismaCode(error);
    if (code === "P2002")
      return new ConflictException(
        "Nilai untuk siswa, mata pelajaran kelas, dan tahun ajaran ini sudah ada.",
      );
    if (code === "P2003")
      return new BadRequestException("Relasi data nilai tidak valid.");
    return error instanceof Error
      ? error
      : new BadRequestException("Operasi nilai siswa gagal.");
  }
}
