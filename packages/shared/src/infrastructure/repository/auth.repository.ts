import type { PrismaClient } from "#generated/client";
import { type RoleEntity, roleSelect } from "#selects/role.select";
import {
  type UserEntity,
  type UserWithPasswordEntity,
  userSelect,
  userWithPasswordSelect,
} from "#selects/user.select";

export interface CreateAuthenticatedUserInput {
  email: string;
  password: string;
}

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.users.findFirst({
      where: { email, deleted_at: null },
      select: userSelect,
    });
  }

  async findDefaultRole(name: string): Promise<RoleEntity | null> {
    return this.prisma.role.findFirst({
      where: { name, deletedAt: null },
      select: roleSelect,
    });
  }

  async createUser(data: CreateAuthenticatedUserInput): Promise<UserEntity> {
    return this.prisma.users.create({
      data: { ...data, is_active: true },
      select: userSelect,
    });
  }

  async findLoginUser(email: string): Promise<UserWithPasswordEntity | null> {
    return this.prisma.users.findFirst({
      where: { email, deleted_at: null },
      select: userWithPasswordSelect,
    });
  }

  async updateLastLogin(id: string): Promise<UserEntity> {
    return this.prisma.users.update({
      where: { id },
      data: { last_login: new Date() },
      select: userSelect,
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<UserEntity> {
    return this.prisma.users.update({
      where: { id },
      data: { password: passwordHash },
      select: userSelect,
    });
  }

  async updateAccessToken(
    id: string,
    accessToken: string,
  ): Promise<UserEntity> {
    return this.prisma.users.update({
      where: { id },
      data: { access_token: accessToken },
      select: userSelect,
    });
  }

  async findActiveUserByAccessToken(
    id: string,
    accessToken: string,
  ): Promise<UserEntity | null> {
    return this.prisma.users.findFirst({
      where: {
        id,
        access_token: accessToken,
        is_active: true,
        deleted_at: null,
      },
      select: userSelect,
    });
  }

  async clearAccessToken(id: string): Promise<UserEntity> {
    return this.prisma.users.update({
      where: { id },
      data: { access_token: null },
      select: userSelect,
    });
  }

  async registerInstitutionOwner(
    userPayload: CreateAuthenticatedUserInput,
    institutionName: string,
    roleId: string,
  ): Promise<UserEntity> {
    return this.prisma.$transaction(async (tx: any) => {
      const user = await tx.users.create({
        data: { ...userPayload, is_active: true },
      });

      const institution = await tx.institution.create({
        data: {
          name: institutionName,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          institutionId: institution.id,
          roleId: roleId,
          fullName: "Institution Admin",
        },
      });

      return tx.users.findUniqueOrThrow({
        where: { id: user.id },
        select: userSelect,
      });
    });
  }

  /**
   * Registers a system superadmin. Profile.institutionId is required by the
   * schema, so the profile is attached to a shared "System" institution that
   * is created on first use (no migration needed).
   */
  async registerSuperAdmin(
    userPayload: CreateAuthenticatedUserInput,
    roleId: string,
  ): Promise<UserEntity> {
    return this.prisma.$transaction(async (tx: any) => {
      const user = await tx.users.create({
        data: { ...userPayload, is_active: true },
      });

      let institution = await tx.institution.findFirst({
        where: { name: "System", deletedAt: null },
      });
      if (!institution) {
        institution = await tx.institution.create({
          data: { name: "System" },
        });
      }

      await tx.profile.create({
        data: {
          userId: user.id,
          institutionId: institution.id,
          roleId,
          fullName: "Super Admin",
        },
      });

      return tx.users.findUniqueOrThrow({
        where: { id: user.id },
        select: userSelect,
      });
    });
  }
}
