import {
  BadRequestException,
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
    const trimmedName = dto.name.trim();
    const existing = await this.roleRepository.findByName(trimmedName);
    if (existing) {
      throw new ConflictException("Role name already exists");
    }

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      const existingPermissions = await this.prisma.client.permission.findMany({
        where: {
          id: { in: dto.permissionIds },
          deletedAt: null,
        },
        select: { id: true },
      });
      if (existingPermissions.length !== dto.permissionIds.length) {
        throw new BadRequestException("One or more permission IDs are invalid");
      }
    }

    return this.roleRepository.create({
      name: trimmedName,
      ...(dto.description !== undefined && dto.description !== null
        ? { description: dto.description.trim() }
        : {}),
      ...(dto.permissionIds ? { permissionIds: dto.permissionIds } : {}),
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    if (dto.name) {
      const trimmedName = dto.name.trim();
      const existing = await this.roleRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new ConflictException("Role name already in use by another role");
      }
    }

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      const existingPermissions = await this.prisma.client.permission.findMany({
        where: {
          id: { in: dto.permissionIds },
          deletedAt: null,
        },
        select: { id: true },
      });
      if (existingPermissions.length !== dto.permissionIds.length) {
        throw new BadRequestException("One or more permission IDs are invalid");
      }
    }

    return this.roleRepository.update(id, {
      ...(dto.name ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ? dto.description.trim() : null }
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
