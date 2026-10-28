import type { ReferralCodeEntity } from "#entities/referral-codes.entity";
import type { Prisma, PrismaClient } from "#generated/client";
import { referralCodeSelect } from "#selects/referral-codes.select";

export interface CreateReferralCodeInput {
  code: string;
  institutionId: string;
  usageQuota?: number | null | undefined;
  enrollmentYear?: number | null | undefined;
  departmentId?: string | null | undefined;
  expiresAt?: Date | string | null | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateReferralCodeInput {
  usageQuota?: number | null | undefined;
  enrollmentYear?: number | null | undefined;
  departmentId?: string | null | undefined;
  expiresAt?: Date | string | null | undefined;
  isActive?: boolean | undefined;
}

export interface FindAllReferralCodesInput {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?:
    | ("all" | "active" | "inactive" | "expired" | "exhausted")
    | undefined;
  institutionId?: string | undefined;
  departmentId?: string | undefined;
  enrollmentYear?: number | undefined;
}

export interface FindAllReferralCodesResult {
  data: ReferralCodeEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ReferralCodesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateReferralCodeInput): Promise<ReferralCodeEntity> {
    return this.prisma.referralCodes.create({
      data: {
        code: data.code.trim().toUpperCase(),
        institution_id: data.institutionId,
        usage_quota: data.usageQuota ?? null,
        used_count: 0,
        enrollment_year: data.enrollmentYear ?? null,
        department_id: data.departmentId ?? null,
        expires_at: data.expiresAt ? new Date(data.expiresAt) : null,
        is_active: data.isActive ?? true,
      },
      select: referralCodeSelect,
    });
  }

  async findById(id: string): Promise<ReferralCodeEntity | null> {
    return this.prisma.referralCodes.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: referralCodeSelect,
    });
  }

  async findByCode(code: string): Promise<ReferralCodeEntity | null> {
    return this.prisma.referralCodes.findFirst({
      where: {
        code: { equals: code.trim(), mode: "insensitive" },
        deleted_at: null,
      },
      select: referralCodeSelect,
    });
  }

  async findAll(
    params: FindAllReferralCodesInput = {},
  ): Promise<FindAllReferralCodesResult> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const search = params.search?.trim();
    const now = new Date();

    const where: Prisma.ReferralCodesWhereInput = {
      deleted_at: null,
      ...(params.institutionId ? { institution_id: params.institutionId } : {}),
      ...(params.departmentId ? { department_id: params.departmentId } : {}),
      ...(params.enrollmentYear
        ? { enrollment_year: params.enrollmentYear }
        : {}),
      ...(search
        ? {
            code: { contains: search, mode: "insensitive" },
          }
        : {}),
    };

    if (params.status === "active") {
      where.is_active = true;
      where.OR = [{ expires_at: null }, { expires_at: { gt: now } }];
    } else if (params.status === "inactive") {
      where.is_active = false;
    } else if (params.status === "expired") {
      where.expires_at = { lte: now };
    }

    const [total, data] = await Promise.all([
      this.prisma.referralCodes.count({ where }),
      this.prisma.referralCodes.findMany({
        where,
        select: referralCodeSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
    ]);

    // Optional in-memory filter if exhausted is requested
    let filteredData = data;
    if (params.status === "exhausted") {
      filteredData = data.filter(
        (item) =>
          item.usage_quota !== null && item.used_count >= item.usage_quota,
      );
    }

    return {
      data: filteredData,
      meta: {
        page,
        limit,
        total: params.status === "exhausted" ? filteredData.length : total,
        totalPages: Math.ceil(
          (params.status === "exhausted" ? filteredData.length : total) / limit,
        ),
      },
    };
  }

  async update(
    id: string,
    data: UpdateReferralCodeInput,
  ): Promise<ReferralCodeEntity> {
    const updateData: Prisma.ReferralCodesUpdateInput = {};

    if (data.usageQuota !== undefined) {
      updateData.usage_quota = data.usageQuota;
    }
    if (data.enrollmentYear !== undefined) {
      updateData.enrollment_year = data.enrollmentYear;
    }
    if (data.departmentId !== undefined) {
      updateData.department = data.departmentId
        ? { connect: { id: data.departmentId } }
        : { disconnect: true };
    }
    if (data.expiresAt !== undefined) {
      updateData.expires_at = data.expiresAt ? new Date(data.expiresAt) : null;
    }
    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive;
    }

    return this.prisma.referralCodes.update({
      where: { id },
      data: updateData,
      select: referralCodeSelect,
    });
  }

  async toggleActive(
    id: string,
    isActive?: boolean,
  ): Promise<ReferralCodeEntity> {
    const current = await this.findById(id);
    if (!current) {
      throw new Error("Referral code not found");
    }
    const nextStatus = isActive !== undefined ? isActive : !current.is_active;
    return this.prisma.referralCodes.update({
      where: { id },
      data: { is_active: nextStatus },
      select: referralCodeSelect,
    });
  }

  async softDelete(id: string): Promise<ReferralCodeEntity> {
    return this.prisma.referralCodes.update({
      where: { id },
      data: { deleted_at: new Date() },
      select: referralCodeSelect,
    });
  }

  /**
   * Atomically checks quota & expiry, increments used_count if valid.
   * Concurrency safe: returns null or false if quota is exceeded or code is expired/inactive.
   */
  async consumeReferralCodeAtomic(
    code: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<ReferralCodeEntity | null> {
    const client = txClient ?? this.prisma;
    const now = new Date();

    // Find code first
    const referral = await client.referralCodes.findFirst({
      where: {
        code: { equals: code.trim(), mode: "insensitive" },
        deleted_at: null,
      },
    });

    if (!referral) return null;
    if (!referral.is_active) return null;
    if (referral.expires_at && referral.expires_at <= now) return null;
    if (
      referral.usage_quota !== null &&
      referral.used_count >= referral.usage_quota
    ) {
      return null;
    }

    // Atomic increment with concurrency protection
    // We execute an update with a condition ensuring used_count was not modified past usage_quota
    try {
      const updated = await client.referralCodes.update({
        where: {
          id: referral.id,
          // Guarantee concurrency condition
          ...(referral.usage_quota !== null
            ? { used_count: { lt: referral.usage_quota } }
            : {}),
        },
        data: {
          used_count: { increment: 1 },
        },
        select: referralCodeSelect,
      });
      return updated;
    } catch {
      // If condition failed due to concurrent race, returns null
      return null;
    }
  }
}
