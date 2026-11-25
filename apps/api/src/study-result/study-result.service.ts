import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { StudyResultRepository } from "@repo/shared/infrastructure/repository/study-result.repository";
import type {
  CreateStudyResultDto,
  UpdateStudyResultDto,
} from "@repo/shared/schemas/study-result.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudyResultService {
  private readonly repository: StudyResultRepository;

  constructor(private readonly prisma: PrismaService) {
    this.repository = new StudyResultRepository(this.prisma.client);
  }

  async findAll(page = 1, limit = 10, search?: string) {
    return this.repository.findAll(page, limit, { search });
  }

  async findOne(id: string) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException("Study result record not found");
    }
    return record;
  }

  async findByStudentId(studentId: string) {
    const studentExists = await this.prisma.client.student.findFirst({
      where: { id: studentId, deletedAt: null },
    });
    if (!studentExists) {
      throw new NotFoundException("Student not found");
    }
    return this.repository.findByStudentId(studentId);
  }

  async findByAcademicYearId(academicYearId: string) {
    const academicYearExists = await this.prisma.client.academicYears.findFirst(
      {
        where: { id: academicYearId, deleted_at: null },
      },
    );
    if (!academicYearExists) {
      throw new NotFoundException("Academic year not found");
    }
    return this.repository.findByAcademicYearId(academicYearId);
  }

  async findBySemesterId(semesterId: string) {
    const semesterExists = await this.prisma.client.semesters.findFirst({
      where: { id: semesterId, deleted_at: null },
    });
    if (!semesterExists) {
      throw new NotFoundException("Semester not found");
    }
    return this.repository.findBySemesterId(semesterId);
  }

  async create(dto: CreateStudyResultDto) {
    const studentExists = await this.prisma.client.student.findFirst({
      where: { id: dto.studentId, deletedAt: null },
    });
    if (!studentExists) {
      throw new NotFoundException("Student not found");
    }

    const academicYearExists = await this.prisma.client.academicYears.findFirst(
      {
        where: { id: dto.academicYearId, deleted_at: null },
      },
    );
    if (!academicYearExists) {
      throw new NotFoundException("Academic year not found");
    }

    const semesterExists = await this.prisma.client.semesters.findFirst({
      where: { id: dto.semesterId, deleted_at: null },
    });
    if (!semesterExists) {
      throw new NotFoundException("Semester not found");
    }

    if (dto.academicStatusId) {
      const statusExists = await this.prisma.client.academicStatuses.findFirst({
        where: { id: dto.academicStatusId, deleted_at: null },
      });
      if (!statusExists) {
        throw new NotFoundException("Academic status not found");
      }
    }

    const existingCombination = await this.repository.findByUniqueCombination(
      dto.studentId,
      dto.academicYearId,
      dto.semesterId,
    );
    if (existingCombination) {
      throw new ConflictException(
        "Study result record already exists for this student, academic year, and semester",
      );
    }

    return this.repository.create({
      studentId: dto.studentId,
      academicYearId: dto.academicYearId,
      semesterId: dto.semesterId,
      totalCredits: dto.totalCredits,
      semesterGpa: dto.semesterGpa,
      cumulativeGpa: dto.cumulativeGpa,
      academicStatusId: dto.academicStatusId,
    });
  }

  async update(id: string, dto: UpdateStudyResultDto) {
    const current = await this.findOne(id);

    const targetStudentId = dto.studentId ?? current.studentId;
    const targetAcademicYearId = dto.academicYearId ?? current.academicYearId;
    const targetSemesterId = dto.semesterId ?? current.semesterId;

    if (dto.studentId !== undefined && dto.studentId !== current.studentId) {
      const studentExists = await this.prisma.client.student.findFirst({
        where: { id: dto.studentId, deletedAt: null },
      });
      if (!studentExists) {
        throw new NotFoundException("Student not found");
      }
    }

    if (
      dto.academicYearId !== undefined &&
      dto.academicYearId !== current.academicYearId
    ) {
      const academicYearExists =
        await this.prisma.client.academicYears.findFirst({
          where: { id: dto.academicYearId, deleted_at: null },
        });
      if (!academicYearExists) {
        throw new NotFoundException("Academic year not found");
      }
    }

    if (dto.semesterId !== undefined && dto.semesterId !== current.semesterId) {
      const semesterExists = await this.prisma.client.semesters.findFirst({
        where: { id: dto.semesterId, deleted_at: null },
      });
      if (!semesterExists) {
        throw new NotFoundException("Semester not found");
      }
    }

    if (
      dto.academicStatusId !== undefined &&
      dto.academicStatusId !== current.academicStatusId
    ) {
      if (dto.academicStatusId !== null) {
        const statusExists =
          await this.prisma.client.academicStatuses.findFirst({
            where: { id: dto.academicStatusId, deleted_at: null },
          });
        if (!statusExists) {
          throw new NotFoundException("Academic status not found");
        }
      }
    }

    if (
      targetStudentId !== current.studentId ||
      targetAcademicYearId !== current.academicYearId ||
      targetSemesterId !== current.semesterId
    ) {
      const existingCombination = await this.repository.findByUniqueCombination(
        targetStudentId,
        targetAcademicYearId,
        targetSemesterId,
      );
      if (existingCombination && existingCombination.id !== id) {
        throw new ConflictException(
          "Study result record already exists for this student, academic year, and semester",
        );
      }
    }

    return this.repository.update(id, {
      ...(dto.studentId !== undefined ? { studentId: dto.studentId } : {}),
      ...(dto.academicYearId !== undefined
        ? { academicYearId: dto.academicYearId }
        : {}),
      ...(dto.semesterId !== undefined ? { semesterId: dto.semesterId } : {}),
      ...(dto.totalCredits !== undefined
        ? { totalCredits: dto.totalCredits }
        : {}),
      ...(dto.semesterGpa !== undefined
        ? { semesterGpa: dto.semesterGpa }
        : {}),
      ...(dto.cumulativeGpa !== undefined
        ? { cumulativeGpa: dto.cumulativeGpa }
        : {}),
      ...(dto.academicStatusId !== undefined
        ? { academicStatusId: dto.academicStatusId }
        : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.delete(id);
  }
}
