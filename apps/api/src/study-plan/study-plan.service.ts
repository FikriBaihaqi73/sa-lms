import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AcademicYearRepository } from "@repo/shared/infrastructure/repository/academic-year.repository";
import { ClassSubjectsRepository } from "@repo/shared/infrastructure/repository/class-subjects.repository";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
import { StudyPlanRepository } from "@repo/shared/infrastructure/repository/study-plan.repository";
import type {
  CreateStudyPlanDto,
  UpdateStudyPlanDto,
} from "@repo/shared/schemas/study-plan.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudyPlanService {
  private readonly academicYearRepository: AcademicYearRepository;
  private readonly classSubjectsRepository: ClassSubjectsRepository;
  private readonly studentRepository: StudentRepository;
  private readonly studyPlanRepository: StudyPlanRepository;

  constructor(private readonly prisma: PrismaService) {
    this.academicYearRepository = new AcademicYearRepository(
      this.prisma.client,
    );
    this.classSubjectsRepository = new ClassSubjectsRepository(
      this.prisma.client,
    );
    this.studentRepository = new StudentRepository(this.prisma.client);
    this.studyPlanRepository = new StudyPlanRepository(this.prisma.client);
  }

  async findAll(
    page: number,
    limit: number,
    filters?: {
      search?: string | undefined;
      student_id?: string | undefined;
      class_subject_id?: string | undefined;
      academic_year_id?: string | undefined;
      department_id?: string | undefined;
    },
  ) {
    return this.studyPlanRepository.findAll(page, limit, filters);
  }

  async findOne(id: string) {
    const studyPlan = await this.studyPlanRepository.findById(id);
    if (!studyPlan) throw new NotFoundException("Study plan not found");
    return studyPlan;
  }

  async create(dto: CreateStudyPlanDto) {
    const classSubject = await this.classSubjectsRepository.findById(
      dto.class_subject_id,
    );
    if (!classSubject) throw new NotFoundException("Class subject not found");

    const resolvedAcademicYearId =
      dto.academic_year_id ?? classSubject.academic_year_id;

    if (
      dto.academic_year_id &&
      dto.academic_year_id !== classSubject.academic_year_id
    ) {
      throw new ConflictException(
        "Tahun ajaran tidak sesuai dengan mata pelajaran kelas yang dipilih",
      );
    }

    const student = await this.studentRepository.findById(dto.student_id);
    if (!student) throw new NotFoundException("Student not found");

    const academicYear = await this.academicYearRepository.findById(
      resolvedAcademicYearId,
    );
    if (!academicYear) throw new NotFoundException("Academic year not found");

    await this.ensureUnique(
      dto.student_id,
      dto.class_subject_id,
      resolvedAcademicYearId,
    );

    return this.studyPlanRepository.create({
      student_id: dto.student_id,
      class_subject_id: dto.class_subject_id,
      academic_year_id: resolvedAcademicYearId,
    });
  }

  async update(id: string, dto: UpdateStudyPlanDto) {
    const current = await this.findOne(id);
    const targetClassSubjectId =
      dto.class_subject_id ?? current.class_subject_id;
    const classSubject =
      await this.classSubjectsRepository.findById(targetClassSubjectId);
    if (!classSubject) throw new NotFoundException("Class subject not found");

    const targetAcademicYearId =
      dto.academic_year_id ??
      (dto.class_subject_id
        ? classSubject.academic_year_id
        : current.academic_year_id);

    const values = {
      student_id: dto.student_id ?? current.student_id,
      class_subject_id: targetClassSubjectId,
      academic_year_id: targetAcademicYearId,
    };

    const student = await this.studentRepository.findById(values.student_id);
    if (!student) throw new NotFoundException("Student not found");

    const academicYear = await this.academicYearRepository.findById(
      values.academic_year_id,
    );
    if (!academicYear) throw new NotFoundException("Academic year not found");

    await this.ensureUnique(
      values.student_id,
      values.class_subject_id,
      values.academic_year_id,
      id,
    );

    return this.studyPlanRepository.update(id, {
      ...(dto.student_id !== undefined ? { student_id: dto.student_id } : {}),
      ...(dto.class_subject_id !== undefined
        ? { class_subject_id: dto.class_subject_id }
        : {}),
      academic_year_id: values.academic_year_id,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.studyPlanRepository.delete(id);
    return { success: true, id };
  }

  private async ensureUnique(
    studentId: string,
    classSubjectId: string,
    academicYearId: string,
    excludedId?: string,
  ) {
    const existing =
      await this.studyPlanRepository.findByStudentClassSubjectAndAcademicYear(
        studentId,
        classSubjectId,
        academicYearId,
      );
    if (existing && existing.id !== excludedId) {
      throw new ConflictException(
        "Siswa sudah terdaftar pada mata pelajaran kelas ini untuk tahun ajaran yang dipilih.",
      );
    }
  }
}
