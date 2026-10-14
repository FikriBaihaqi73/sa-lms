import type { Prisma, PrismaClient } from "#generated/client";
import {
  type AcademicYearEntity,
  academicYearSelect,
} from "#selects/academic-year.select";

export interface CreateAcademicYearInput {
  academic_year: string;
  is_active?: boolean;
  institution_id: string;
}

export interface UpdateAcademicYearInput {
  academic_year?: string;
  is_active?: boolean;
}

export interface FindAllAcademicYearInput {
  institution_id?: string;
}

export class AcademicYearRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAcademicYearInput): Promise<AcademicYearEntity> {
    return this.prisma.academicYears.create({
      data: {
        academic_year: data.academic_year,
        is_active: data.is_active ?? false,
        institution_id: data.institution_id,
      },
      select: academicYearSelect,
    });
  }

  /**
   * Look up an academic year by ID. When `institutionId` is supplied the
   * lookup is scoped to that institution so records owned by another
   * institution are reported as missing instead of leaked.
   */
  async findById(
    id: string,
    institutionId?: string,
  ): Promise<AcademicYearEntity | null> {
    return this.prisma.academicYears.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institutionId !== undefined
          ? { institution_id: institutionId }
          : {}),
      },
      select: academicYearSelect,
    });
  }

  /**
   * Look up an academic year by its label. When `institutionId` is supplied
   * the uniqueness check is limited to the caller's institution, allowing
   * different institutions to reuse the same academic year label.
   */
  async findByAcademicYear(
    academic_year: string,
    institutionId?: string,
  ): Promise<AcademicYearEntity | null> {
    return this.prisma.academicYears.findFirst({
      where: {
        academic_year,
        deleted_at: null,
        ...(institutionId !== undefined
          ? { institution_id: institutionId }
          : {}),
      },
      select: academicYearSelect,
    });
  }

  /**
   * List academic years. An `institutionId` is required in practice (every
   * authenticated caller belongs to an institution); it stays optional so the
   * signature remains backwards compatible with unscoped read-only callers.
   */
  async findAll(
    params: FindAllAcademicYearInput = {},
  ): Promise<AcademicYearEntity[]> {
    return this.prisma.academicYears.findMany({
      where: {
        deleted_at: null,
        ...(params.institution_id !== undefined
          ? { institution_id: params.institution_id }
          : {}),
      } satisfies Prisma.AcademicYearsWhereInput,
      select: academicYearSelect,
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async update(
    id: string,
    data: UpdateAcademicYearInput,
  ): Promise<AcademicYearEntity> {
    return this.prisma.academicYears.update({
      where: {
        id,
      },
      data: {
        ...(data.academic_year !== undefined && {
          academic_year: data.academic_year,
        }),
        ...(data.is_active !== undefined && {
          is_active: data.is_active,
        }),
      },
      select: academicYearSelect,
    });
  }

  async delete(id: string): Promise<AcademicYearEntity> {
    return this.prisma.academicYears.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
      select: academicYearSelect,
    });
  }
}
