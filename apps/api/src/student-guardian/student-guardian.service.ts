import {
  ConflictException,

  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
import { StudentGuardianRepository } from "@repo/shared/infrastructure/repository/student-guardian.repository";
import type {
  CreateStudentGuardianDto,
  UpdateStudentGuardianDto,
} from "@repo/shared/schemas/student-guardian.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudentGuardianService {
  private readonly repository: StudentGuardianRepository;
  private readonly studentRepository: StudentRepository;

  constructor(private readonly prisma: PrismaService) {
    this.studentRepository = new StudentRepository(this.prisma.client);
    this.repository = new StudentGuardianRepository(this.prisma.client);
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({ where: { userId, deletedAt: null }, select: { institutionId: true } });
    if (!profile) throw new NotFoundException("Institution profile not found");
    return profile.institutionId;
  }

  async findAll(userId: string, page = 1, limit = 10, search?: string) {
    return this.repository.findAll(page, limit, search, await this.institutionIdFor(userId));
  }

  async studentOptions(userId: string, page = 1, limit = 20, search?: string) {
    return this.studentRepository.findAll({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      institutionId: await this.institutionIdFor(userId),
    });
  }

  async findOne(id: string, userId: string) {
    const record = await this.repository.findById(id, await this.institutionIdFor(userId));
    if (!record) {
      throw new NotFoundException("Student guardian relation not found");
    }
    return record;
  }

  async findByStudentId(studentId: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const studentExists = await this.prisma.client.student.findFirst({
      where: { id: studentId, deletedAt: null, profile: { institutionId } },
    });
    if (!studentExists) {
      throw new NotFoundException("Student not found");
    }
    return this.repository.findByStudentId(studentId, institutionId);
  }

  async findByGuardianId(guardianId: string, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const guardianExists = await this.prisma.client.guardian.findFirst({
      where: { id: guardianId, deletedAt: null, institutionId },
    });
    if (!guardianExists) {
      throw new NotFoundException("Guardian not found");
    }
    return this.repository.findByGuardianId(guardianId, institutionId);
  }

  async create(dto: CreateStudentGuardianDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const student = await this.prisma.client.student.findFirst({
      where: { id: dto.studentId, deletedAt: null, profile: { institutionId } },
    });
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const guardian = await this.prisma.client.guardian.findFirst({
      where: { id: dto.guardianId, deletedAt: null, institutionId },
    });
    if (!guardian) {
      throw new NotFoundException("Guardian not found");
    }

    const existingRelation = await this.repository.findByStudentAndGuardian(
      dto.studentId,
      dto.guardianId,
    );
    if (existingRelation) {
      throw new ConflictException("Student guardian relation already exists");
    }

    return this.repository.create({
      studentId: dto.studentId,
      guardianId: dto.guardianId,
      isPrimary: dto.isPrimary ?? false,
    });
  }

  async update(id: string, dto: UpdateStudentGuardianDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    const current = await this.findOne(id, userId);

    const targetStudentId = dto.studentId ?? current.studentId;
    const targetGuardianId = dto.guardianId ?? current.guardianId;

    if (dto.studentId !== undefined && dto.studentId !== current.studentId) {
      const student = await this.prisma.client.student.findFirst({
        where: { id: dto.studentId, deletedAt: null, profile: { institutionId } },
      });
      if (!student) {
        throw new NotFoundException("Student not found");
      }
    }

    if (dto.guardianId !== undefined && dto.guardianId !== current.guardianId) {
      const guardian = await this.prisma.client.guardian.findFirst({
        where: { id: dto.guardianId, deletedAt: null, institutionId },
      });
      if (!guardian) {
        throw new NotFoundException("Guardian not found");
      }
    }

    if (
      targetStudentId !== current.studentId ||
      targetGuardianId !== current.guardianId
    ) {
      const existingRelation = await this.repository.findByStudentAndGuardian(
        targetStudentId,
        targetGuardianId,
      );
      if (existingRelation && existingRelation.id !== id) {
        throw new ConflictException("Student guardian relation already exists");
      }
    }

    return this.repository.update(id, {
      ...(dto.studentId !== undefined ? { studentId: dto.studentId } : {}),
      ...(dto.guardianId !== undefined ? { guardianId: dto.guardianId } : {}),
      ...(dto.isPrimary !== undefined ? { isPrimary: dto.isPrimary } : {}),
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.repository.delete(id);
    return { success: true, id };
  }
}
