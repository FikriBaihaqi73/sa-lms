import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RoleRepository } from "@repo/shared/infrastructure/repository/role.repository";
import type {
  CreateRoleDto,
  UpdateRoleDto,
} from "@repo/shared/schemas/role.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoleService {
  private roleRepository: RoleRepository;

  constructor(private readonly prisma: PrismaService) {
    this.roleRepository = new RoleRepository(this.prisma.client);
  }

  async findAll(page: number, limit: number) {
    return this.roleRepository.findAll(page, limit);
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.roleRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Role name already exists");
    }
    return this.roleRepository.create({
      name: dto.name,
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.permissionIds ? { permissionIds: dto.permissionIds } : {}),
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.roleRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException("Role name already in use by another role");
      }
    }
    return this.roleRepository.update(id, {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? undefined }
        : {}),
      ...(dto.permissionIds !== undefined
        ? { permissionIds: dto.permissionIds }
        : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.roleRepository.delete(id);
    return { success: true, id };
  }
}
