import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AcademicYearRepository } from "@repo/shared/infrastructure/repository/academic-year.repository";
import type {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from "@repo/shared/schemas/academic-year.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AcademicYearService {
  private readonly academicYearRepository: AcademicYearRepository;

  constructor(private readonly prisma: PrismaService) {
    this.academicYearRepository = new AcademicYearRepository(
      this.prisma.client,
    );
  }

  /**
   * Resolve the institution scope from the authenticated user's profile.
   * The institution is never taken from the request body/query so a caller
   * cannot read or mutate another institution's academic years.
   */
  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile) {
      throw new ForbiddenException("Institution access is required");
    }
    return profile.institutionId;
  }

  async findAll(userId: string) {
    return this.academicYearRepository.findAll({
      institution_id: await this.institutionIdFor(userId),
    });
  }

  async findOne(id: string, userId: string) {
    const academicYear = await this.academicYearRepository.findById(
      id,
      await this.institutionIdFor(userId),
    );
    if (!academicYear) {
      throw new NotFoundException("Academic year not found");
    }
    return academicYear;
  }

  async create(dto: CreateAcademicYearDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);

    const existing = await this.academicYearRepository.findByAcademicYear(
      dto.academic_year,
      institutionId,
    );
    if (existing) {
      throw new ConflictException("Academic year already exists");
    }

    return this.academicYearRepository.create({
      academic_year: dto.academic_year,
      is_active: dto.is_active,
      institution_id: institutionId,
    });
  }

  async update(id: string, dto: UpdateAcademicYearDto, userId: string) {
    const institutionId = await this.institutionIdFor(userId);
    await this.findOne(id, userId);

    if (dto.academic_year !== undefined) {
      const existing = await this.academicYearRepository.findByAcademicYear(
        dto.academic_year,
        institutionId,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          "Academic year is already in use by another academic year",
        );
      }
    }

    return this.academicYearRepository.update(id, {
      ...(dto.academic_year !== undefined
        ? { academic_year: dto.academic_year }
        : {}),
      ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.academicYearRepository.delete(id);
    return { success: true, id };
  }
}
