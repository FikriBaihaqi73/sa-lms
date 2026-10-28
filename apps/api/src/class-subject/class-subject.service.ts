import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ClassSubjectsRepository } from "@repo/shared/infrastructure/repository/class-subjects.repository";
import type {
  CreateClassSubjectDto,
  UpdateClassSubjectDto,
} from "@repo/shared/schemas/class-subject.schema";
import { PrismaService } from "../prisma/prisma.service";

interface ClassSubjectFilters {
  search?: string;
  class_id?: string;
  academic_year_id?: string;
  teacher_id?: string;
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

const duplicateMessage =
  "Class subject relation already exists for this class, subject, and academic year";

@Injectable()
export class ClassSubjectService {
  private readonly repository: ClassSubjectsRepository;
  constructor(private readonly prisma: PrismaService) {
    this.repository = new ClassSubjectsRepository(this.prisma.client);
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile)
      throw new ForbiddenException("Institution access is required");
    return profile.institutionId;
  }

  async findAll(
    page: number,
    limit: number,
    filters: ClassSubjectFilters,
    userId: string,
  ) {
    return this.repository.findAll(page, limit, {
      ...filters,
      institution_id: await this.institutionIdFor(userId),
    });
  }

  async findOne(id: string, userId: string) {
    const record = await this.repository.findById(
      id,
      await this.institutionIdFor(userId),
    );
    if (!record)
      throw new NotFoundException("Class subject relation not found");
    return record;
  }

  async findByClass(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.requireRelation("class", id, institutionId);
    return this.repository.findByClass(id, institutionId);
  }
  async findBySubject(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.requireRelation("subject", id, institutionId);
    return this.repository.findBySubject(id, institutionId);
  }
  async findByTeacher(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.requireRelation("teacher", id, institutionId);
    return this.repository.findByTeacher(id, institutionId);
  }
  async findByAcademicYear(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.requireRelation("academicYear", id, institutionId);
    return this.repository.findByAcademicYear(id, institutionId);
  }

  async create(dto: CreateClassSubjectDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.validateRelations(dto, institutionId);
    const existing = await this.repository.findByUniqueCombination(
      dto.class_id,
      dto.subject_id,
      dto.academic_year_id,
      institutionId,
    );
    if (existing) throw new ConflictException(duplicateMessage);
    try {
      return await this.repository.create(dto);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException(duplicateMessage);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateClassSubjectDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const current = await this.findOne(id, userId);
    const target = {
      class_id: dto.class_id ?? current.class_id,
      subject_id: dto.subject_id ?? current.subject_id,
      teacher_id: dto.teacher_id ?? current.teacher_id,
      academic_year_id: dto.academic_year_id ?? current.academic_year_id,
    };
    await this.validateRelations(target, institutionId);
    const existing = await this.repository.findByUniqueCombination(
      target.class_id,
      target.subject_id,
      target.academic_year_id,
      institutionId,
    );
    if (existing && existing.id !== id)
      throw new ConflictException(duplicateMessage);
    try {
      return await this.repository.update(
        id,
        {
          ...(dto.class_id !== undefined ? { class_id: dto.class_id } : {}),
          ...(dto.subject_id !== undefined ? { subject_id: dto.subject_id } : {}),
          ...(dto.teacher_id !== undefined ? { teacher_id: dto.teacher_id } : {}),
          ...(dto.academic_year_id !== undefined
            ? { academic_year_id: dto.academic_year_id }
            : {}),
        },
        institutionId,
      );
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException(duplicateMessage);
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.findOne(id, userId);
    const usage = await this.repository.findUsage(id, institutionId);
    const usedBy = [
      usage.schedules > 0 ? "Schedule" : null,
      usage.modules > 0 ? "Modules" : null,
      usage.examinations > 0 ? "Examinations" : null,
      usage.studentGrades > 0 ? "StudentGrades" : null,
    ].filter((name): name is string => name !== null);
    if (usedBy.length > 0)
      throw new ConflictException(
        `Class subject cannot be deleted because it is used by ${usedBy.join(", ")}`,
      );
    return this.repository.delete(id, institutionId);
  }

  private async validateRelations(
    data: {
      class_id: string;
      subject_id: string;
      teacher_id: string;
      academic_year_id: string;
    },
    institutionId: string,
  ) {
    await Promise.all([
      this.requireRelation("class", data.class_id, institutionId),
      this.requireRelation("subject", data.subject_id, institutionId),
      this.requireRelation("teacher", data.teacher_id, institutionId),
      this.requireRelation(
        "academicYear",
        data.academic_year_id,
        institutionId,
      ),
    ]);
  }

  private async requireRelation(
    relation: "class" | "subject" | "teacher" | "academicYear",
    id: string,
    institutionId: string,
  ) {
    const where =
      relation === "class"
        ? { id, institution_id: institutionId, deleted_at: null }
        : relation === "subject"
          ? { id, institutionId, deletedAt: null }
          : relation === "teacher"
            ? { id, deleted_at: null, profile: { institutionId } }
            : { id, institution_id: institutionId, deleted_at: null };
    const record =
      relation === "class"
        ? await this.prisma.client.classes.findFirst({ where })
        : relation === "subject"
          ? await this.prisma.client.subject.findFirst({ where })
          : relation === "teacher"
            ? await this.prisma.client.teachers.findFirst({ where })
            : await this.prisma.client.academicYears.findFirst({ where });
    if (!record) {
      const labels = {
        class: "Class",
        subject: "Subject",
        teacher: "Teacher",
        academicYear: "Academic year",
      } as const;
      throw new NotFoundException(`${labels[relation]} not found`);
    }
    return record;
  }
}
