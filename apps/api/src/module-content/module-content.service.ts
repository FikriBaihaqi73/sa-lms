import { Injectable, NotFoundException } from "@nestjs/common";
import { ModuleRepository } from "@repo/shared/infrastructure/repository/module.repository";
import {
  ModuleContentRepository,
  type ModuleContentSearchInput,
} from "@repo/shared/infrastructure/repository/module-content.repository";
import type {
  CreateModuleContentDto,
  UpdateModuleContentDto,
} from "@repo/shared/schemas/module-content.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ModuleContentService {
  private readonly moduleContentRepository: ModuleContentRepository;
  private readonly moduleRepository: ModuleRepository;

  constructor(private readonly prisma: PrismaService) {
    this.moduleContentRepository = new ModuleContentRepository(
      this.prisma.client,
    );
    this.moduleRepository = new ModuleRepository(this.prisma.client);
  }

  async findAll(
    page: number,
    limit: number,
    filters?: ModuleContentSearchInput,
  ) {
    return this.moduleContentRepository.findAll(page, limit, filters);
  }

  async findOne(id: string) {
    const moduleContent = await this.moduleContentRepository.findById(id);
    if (!moduleContent) throw new NotFoundException("Module content not found");
    return moduleContent;
  }

  async create(dto: CreateModuleContentDto) {
    await this.ensureModuleExists(dto.moduleId);
    return this.moduleContentRepository.create({
      moduleId: dto.moduleId,
      title: dto.title,
      contentType: dto.contentType,
      ...(dto.content !== undefined
        ? { content: dto.content ?? undefined }
        : {}),
      ...(dto.fileId !== undefined ? { fileId: dto.fileId ?? undefined } : {}),
      ...(dto.sortOrder !== undefined
        ? { sortOrder: dto.sortOrder ?? undefined }
        : {}),
    });
  }

  async update(id: string, dto: UpdateModuleContentDto) {
    await this.findOne(id);
    if (dto.moduleId !== undefined) await this.ensureModuleExists(dto.moduleId);
    return this.moduleContentRepository.update(id, {
      ...(dto.moduleId !== undefined ? { moduleId: dto.moduleId } : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.contentType !== undefined
        ? { contentType: dto.contentType }
        : {}),
      ...(dto.content !== undefined
        ? { content: dto.content ?? undefined }
        : {}),
      ...(dto.fileId !== undefined ? { fileId: dto.fileId ?? undefined } : {}),
      ...(dto.sortOrder !== undefined
        ? { sortOrder: dto.sortOrder ?? undefined }
        : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.moduleContentRepository.delete(id);
    return { success: true, id };
  }

  private async ensureModuleExists(moduleId: string) {
    const learningModule = await this.moduleRepository.findById(moduleId);
    if (!learningModule)
      throw new NotFoundException("Learning module not found");
  }
}
