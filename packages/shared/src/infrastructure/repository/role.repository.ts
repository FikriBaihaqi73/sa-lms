import type { PrismaClient } from "#generated/client";
import { type RoleEntity, roleSelect } from "#selects/role.select";

export interface CreateRoleInput {
  name: string;
  description?: string | undefined;
  permissionIds?: string[] | undefined;
}

export interface UpdateRoleInput {
  name?: string | undefined;
  description?: string | undefined;
  permissionIds?: string[] | undefined;
}

export class RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRoleInput): Promise<RoleEntity> {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ...(data.permissionIds &&
          data.permissionIds.length > 0 && {
            rolePermissions: {
              create: data.permissionIds.map((permissionId) => ({
                permission: { connect: { id: permissionId } },
              })),
            },
          }),
      },
      select: roleSelect,
    });
  }

  async findById(id: string): Promise<RoleEntity | null> {
    return this.prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: roleSelect,
    });
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.prisma.role.findFirst({
      where: {
        name,
        deletedAt: null,
      },
      select: roleSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: RoleEntity[]; meta: any }> {
    const skip = (page - 1) * limit;

    const [data, totalData] = await Promise.all([
      this.prisma.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take: limit,
        select: roleSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.role.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limit);

    return {
      data,
      meta: {
        totalData,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    };
  }

  async update(id: string, data: UpdateRoleInput): Promise<RoleEntity> {
    return this.prisma.role.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.permissionIds !== undefined && {
          rolePermissions: {
            deleteMany: {},
            create: data.permissionIds.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
            })),
          },
        }),
      },
      select: roleSelect,
    });
  }

  async delete(id: string): Promise<RoleEntity> {
    return this.prisma.role.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: roleSelect,
    });
  }
}
