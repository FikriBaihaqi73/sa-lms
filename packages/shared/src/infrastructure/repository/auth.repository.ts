import type { Prisma, PrismaClient } from "#generated/client";
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

export interface ReferralInstitution {
  referralId: string;
  institutionId: string;
  departmentId?: string | null;
  enrollmentYear?: number | null;
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

  async findValidReferralInstitution(
    referralCode: string,
  ): Promise<ReferralInstitution | null> {
    const code = await this.prisma.referralCodes.findFirst({
      where: {
        code: { equals: referralCode, mode: "insensitive" },
        is_active: true,
        deleted_at: null,
      },
      select: {
        id: true,
        institution_id: true,
        department_id: true,
        enrollment_year: true,
        usage_quota: true,
        used_count: true,
        expires_at: true,
      },
    });

    if (!code) {
      return null;
    }

    if (code.expires_at && code.expires_at < new Date()) {
      return null;
    }

    if (code.usage_quota !== null && code.used_count >= code.usage_quota) {
      return null;
    }

    return {
      referralId: code.id,
      institutionId: code.institution_id,
      departmentId: code.department_id,
      enrollmentYear: code.enrollment_year,
    };
  }

  async createUser(data: CreateAuthenticatedUserInput): Promise<UserEntity> {
    return this.prisma.users.create({
      data: { ...data, is_active: true },
      select: userSelect,
    });
  }

  async registerStudent(
    userPayload: CreateAuthenticatedUserInput,
    referral: ReferralInstitution,
    roleId: string,
  ): Promise<UserEntity> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.referralCodes.update({
        where: { id: referral.referralId },
        data: { used_count: { increment: 1 } },
      });

      const user = await tx.users.create({
        data: { ...userPayload, is_active: true },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          institutionId: referral.institutionId,
          roleId,
          fullName: user.email,
          email: user.email,
        },
      });

      let academicStatus = await tx.academicStatuses.findFirst({
        where: {
          name: { in: ["Aktif", "aktif", "Active", "active"] },
          deleted_at: null,
        },
      });

      if (!academicStatus) {
        academicStatus = await tx.academicStatuses.findFirst({
          where: { deleted_at: null },
        });
      }

      if (!academicStatus) {
        academicStatus = await tx.academicStatuses.create({
          data: { name: "Aktif", description: "Status aktif standar" },
        });
      }

      const studentNumber = `STU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await tx.student.create({
        data: {
          profileId: profile.id,
          academicStatusId: academicStatus.id,
          studentNumber,
          enrollmentYear: referral.enrollmentYear ?? new Date().getFullYear(),
          departmentId: referral.departmentId ?? null,
        },
      });

      return tx.users.findUniqueOrThrow({
        where: { id: user.id },
        select: userSelect,
      });
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
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
