import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ResponseHelper } from "@repo/shared/http/response";
import { ReferralCodesRepository } from "@repo/shared/infrastructure/repository/referral-codes.repository";
import type {
  CreateReferralCodeDto,
  QueryReferralCodeDto,
  UpdateReferralCodeDto,
} from "@repo/shared/schemas/referral-codes.schema";
import { PrismaService } from "../prisma/prisma.service";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCodeSegment(length = 6): string {
  let segment = "";
  for (let i = 0; i < length; i++) {
    segment += REFERRAL_ALPHABET.charAt(
      Math.floor(Math.random() * REFERRAL_ALPHABET.length),
    );
  }
  return segment;
}

@Injectable()
export class ReferralCodesService {
  private readonly repository: ReferralCodesRepository;

  constructor(private readonly prisma: PrismaService) {
    this.repository = new ReferralCodesRepository(this.prisma.client);
  }

  private async resolveInstitutionId(
    userId?: string,
    providedInstitutionId?: string,
  ): Promise<string> {
    if (providedInstitutionId) {
      return providedInstitutionId;
    }

    if (userId) {
      const profile = await this.prisma.client.profile.findFirst({
        where: { userId, deletedAt: null },
        select: { institutionId: true },
      });
      if (profile?.institutionId) {
        return profile.institutionId;
      }
    }

    // Fallback: pick the first available institution
    const defaultInst = await this.prisma.client.institution.findFirst({
      where: { deletedAt: null },
      select: { id: true },
    });
    if (!defaultInst) {
      throw new NotFoundException("Institusi tidak ditemukan");
    }
    return defaultInst.id;
  }

  private async generateUniqueCode(year: number): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = `REF-${year}-${generateCodeSegment(6)}`;
      const existing = await this.repository.findByCode(code);
      if (!existing) {
        return code;
      }
    }
    return `REF-${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  }

  async create(dto: CreateReferralCodeDto, userId?: string) {
    const institutionId = await this.resolveInstitutionId(
      userId,
      dto.institutionId,
    );

    const year = dto.enrollmentYear ?? new Date().getFullYear();
    const code = dto.code?.trim()
      ? dto.code.trim().toUpperCase()
      : await this.generateUniqueCode(year);

    const existing = await this.repository.findByCode(code);
    if (existing) {
      throw new ConflictException(`Kode referral ${code} sudah digunakan`);
    }

    if (dto.departmentId) {
      const department = await this.prisma.client.departments.findFirst({
        where: {
          id: dto.departmentId,
          deleted_at: null,
          institution_id: institutionId,
        },
      });
      if (!department) {
        throw new NotFoundException(
          "Jurusan tidak ditemukan pada institusi ini",
        );
      }
    }

    const created = await this.repository.create({
      code,
      institutionId,
      usageQuota: dto.usageQuota ?? null,
      enrollmentYear: dto.enrollmentYear ?? null,
      departmentId: dto.departmentId ?? null,
      expiresAt: dto.expiresAt || null,
      isActive: dto.isActive ?? true,
    });

    return ResponseHelper.success(created, "Kode referral berhasil dibuat");
  }

  async findAll(query: QueryReferralCodeDto, userId?: string) {
    let institutionId: string | undefined;
    try {
      institutionId = await this.resolveInstitutionId(userId);
    } catch {
      // Superadmin or unattached user can see all
      institutionId = undefined;
    }

    const result = await this.repository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
      institutionId,
      departmentId: query.departmentId,
      enrollmentYear: query.enrollmentYear,
    });

    return ResponseHelper.success(
      result,
      "Daftar kode referral berhasil diambil",
    );
  }

  async findById(id: string) {
    const referralCode = await this.repository.findById(id);
    if (!referralCode) {
      throw new NotFoundException("Kode referral tidak ditemukan");
    }

    return ResponseHelper.success(
      referralCode,
      "Detail kode referral berhasil diambil",
    );
  }

  async update(id: string, dto: UpdateReferralCodeDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException("Kode referral tidak ditemukan");
    }

    if (dto.departmentId) {
      const department = await this.prisma.client.departments.findFirst({
        where: {
          id: dto.departmentId,
          deleted_at: null,
          institution_id: existing.institution_id,
        },
      });
      if (!department) {
        throw new NotFoundException(
          "Jurusan tidak ditemukan pada institusi ini",
        );
      }
    }

    const updated = await this.repository.update(id, {
      usageQuota: dto.usageQuota,
      enrollmentYear: dto.enrollmentYear,
      departmentId: dto.departmentId,
      expiresAt: dto.expiresAt,
      isActive: dto.isActive,
    });

    return ResponseHelper.success(updated, "Kode referral berhasil diperbarui");
  }

  async toggleActive(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException("Kode referral tidak ditemukan");
    }

    const updated = await this.repository.toggleActive(id);
    const message = updated.is_active
      ? "Kode referral berhasil diaktifkan"
      : "Kode referral berhasil dinonaktifkan";

    return ResponseHelper.success(updated, message);
  }

  async delete(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException("Kode referral tidak ditemukan");
    }

    const deleted = await this.repository.softDelete(id);
    return ResponseHelper.success(deleted, "Kode referral berhasil dihapus");
  }
}
