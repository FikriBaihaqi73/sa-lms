import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { SubjectEntity } from "@repo/shared/entities/subject.entity";
import { SubjectRepository } from "@repo/shared/infrastructure/repository/subject.repository";
import type {
  CreateSubjectDto,
  SubjectQueryDto,
  UpdateSubjectDto,
} from "@repo/shared/schemas/subject.schema";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SubjectService {
  private readonly subjectRepository: SubjectRepository;

  constructor(private readonly prisma: PrismaService) {
    this.subjectRepository = new SubjectRepository(this.prisma.client);
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile) throw new ForbiddenException("Institution access is required");
    return profile.institutionId;
  }

  async create(data: CreateSubjectDto, userId: string): Promise<SubjectEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const existing = await this.subjectRepository.findByCode(
      data.code,
      institutionId,
    );
    if (existing) {
      throw new ConflictException("Subject code already exists");
    }
    return this.subjectRepository.create({ ...data, institutionId });
  }

  async findAll(query: SubjectQueryDto, userId: string) {
    const { page, limit, search, departmentId } = query;
    return this.subjectRepository.findAll({
      page,
      limit,
      search,
      institutionId: await this.institutionIdFor(userId),
      departmentId,
    });
  }

  async findOne(id: string, userId: string): Promise<SubjectEntity> {
    const subject = await this.subjectRepository.findById(
      id,
      await this.institutionIdFor(userId),
    );
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }
    return subject;
  }

  async update(
    id: string,
    data: UpdateSubjectDto,
    userId: string,
  ): Promise<SubjectEntity> {
    const institutionId = await this.institutionIdFor(userId);
    const subject = await this.subjectRepository.findById(id, institutionId);
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    if (data.code && data.code !== subject.code) {
      const existing = await this.subjectRepository.findByCode(
        data.code,
        institutionId,
      );
      if (existing) {
        throw new ConflictException("Subject code already exists");
      }
    }

    const { institutionId: _clientInstitutionId, ...updateData } = data;
    return this.subjectRepository.update(id, updateData);
  }

  async remove(id: string, userId: string): Promise<void> {
    const subject = await this.subjectRepository.findById(
      id,
      await this.institutionIdFor(userId),
    );
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }
    await this.subjectRepository.delete(id);
  }
}
