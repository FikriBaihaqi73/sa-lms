import { Injectable, NotFoundException } from "@nestjs/common";
import { ClassSubjectsRepository } from "@repo/shared/infrastructure/repository/class-subjects.repository";
import {
  ModuleRepository,
  type ModuleSearchInput,
} from "@repo/shared/infrastructure/repository/module.repository";
import type {
  CreateModuleDto,
  UpdateModuleDto,
} from "@repo/shared/schemas/module.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LearningModuleService {
  private readonly classSubjectsRepository: ClassSubjectsRepository;
  private readonly moduleRepository: ModuleRepository;

  constructor(private readonly prisma: PrismaService) {
    this.classSubjectsRepository = new ClassSubjectsRepository(
      this.prisma.client,
    );
    this.moduleRepository = new ModuleRepository(this.prisma.client);
  }

  async findAll(
    page: number,
    limit: number,
    filters?: ModuleSearchInput,
  ) {
    return this.moduleRepository.findAll(page, limit, filters);
  }

  async findOne(id: string) {
    const learningModule = await this.moduleRepository.findById(id);
    if (!learningModule)
      throw new NotFoundException("Learning module not found");
    return learningModule;
  }

  async create(dto: CreateModuleDto) {
    await this.ensureClassSubjectExists(dto.class_subject_id);
    return this.moduleRepository.create({
      class_subject_id: dto.class_subject_id,
      title: dto.title,
      ...(dto.description !== undefined
        ? { description: dto.description ?? undefined }
        : {}),
      ...(dto.display_order !== undefined
        ? { display_order: dto.display_order ?? undefined }
        : {}),
      ...(dto.is_published !== undefined
        ? { is_published: dto.is_published ?? undefined }
        : {}),
      ...(dto.is_locked !== undefined
        ? { is_locked: dto.is_locked ?? undefined }
        : {}),
    });
  }

  async update(id: string, dto: UpdateModuleDto) {
    await this.findOne(id);
    if (dto.class_subject_id !== undefined) {
      await this.ensureClassSubjectExists(dto.class_subject_id);
    }
    return this.moduleRepository.update(id, {
      ...(dto.class_subject_id !== undefined
        ? { class_subject_id: dto.class_subject_id }
        : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? undefined }
        : {}),
      ...(dto.display_order !== undefined
        ? { display_order: dto.display_order ?? undefined }
        : {}),
      ...(dto.is_published !== undefined
        ? { is_published: dto.is_published ?? undefined }
        : {}),
      ...(dto.is_locked !== undefined
        ? { is_locked: dto.is_locked ?? undefined }
        : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.moduleRepository.delete(id);
    return { success: true, id };
  }

  private async ensureClassSubjectExists(classSubjectId: string) {
    const classSubject =
      await this.classSubjectsRepository.findById(classSubjectId);
    if (!classSubject) throw new NotFoundException("Class subject not found");
  }
}
