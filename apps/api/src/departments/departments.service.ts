import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DepartmentRepository } from "@repo/shared/infrastructure/repository/departments.repository";
import type {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@repo/shared/schemas/department.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DepartmentsService {
  private readonly departmentRepository: DepartmentRepository;

  constructor(private readonly prisma: PrismaService) {
    this.departmentRepository = new DepartmentRepository(this.prisma.client);
  }

  /**
   * Resolve the institution scope from the authenticated user's profile.
   */
  async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile) {
      throw new ForbiddenException("Institution access is required");
    }
    return profile.institutionId;
  }

  async findAll(
    page: number,
    limit: number,
    filters?: { search?: string | undefined },
    userId?: string,
  ) {
    const institutionId = userId
      ? await this.institutionIdFor(userId)
      : undefined;
    return this.departmentRepository.findAll(page, limit, {
      ...filters,
      institution_id: institutionId,
    });
  }

  async findOne(id: string, userId?: string) {
    const institutionId = userId
      ? await this.institutionIdFor(userId)
      : undefined;
    const department = await this.departmentRepository.findById(
      id,
      institutionId,
    );
    if (!department) throw new NotFoundException("Department not found");
    return department;
  }

  async create(dto: CreateDepartmentDto, userId?: string) {
    const institutionId = userId
      ? await this.institutionIdFor(userId)
      : undefined;
    await this.ensureUniqueName(dto.name, institutionId);
    await this.ensureUniqueCode(dto.code, institutionId);

    return this.departmentRepository.create({
      name: dto.name,
      code: dto.code,
      ...(institutionId !== undefined ? { institution_id: institutionId } : {}),
      ...(dto.teacher_ids !== undefined
        ? { teacher_ids: dto.teacher_ids }
        : {}),
    });
  }

  async update(id: string, dto: UpdateDepartmentDto, userId?: string) {
    const institutionId = userId
      ? await this.institutionIdFor(userId)
      : undefined;
    await this.findOne(id, userId);

    if (dto.name) {
      await this.ensureUniqueName(dto.name, institutionId, id);
    }
    if (dto.code) {
      await this.ensureUniqueCode(dto.code, institutionId, id);
    }

    return this.departmentRepository.update(
      id,
      {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.teacher_ids !== undefined
          ? { teacher_ids: dto.teacher_ids }
          : {}),
      },
      institutionId,
    );
  }

  async remove(id: string, userId?: string) {
    const institutionId = userId
      ? await this.institutionIdFor(userId)
      : undefined;
    await this.findOne(id, userId);
    await this.departmentRepository.delete(id, institutionId);
    return { success: true, id };
  }

  private async ensureUniqueName(
    name: string,
    institutionId?: string,
    excludedId?: string,
  ) {
    const existing = await this.departmentRepository.findByName(
      name,
      institutionId,
    );
    if (existing && existing.id !== excludedId) {
      throw new ConflictException("Department name already exists");
    }
  }

  private async ensureUniqueCode(
    code: string,
    institutionId?: string,
    excludedId?: string,
  ) {
    const existing = await this.departmentRepository.findByCode(
      code,
      institutionId,
    );
    if (existing && existing.id !== excludedId) {
      throw new ConflictException("Department code already exists");
    }
  }
}
