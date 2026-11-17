import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type ExaminationPaginationResult,
  ExaminationRepository,
  type ExaminationResponse,
  type ExaminationSearchInput,
  type ExaminationStats,
} from "@repo/shared/infrastructure/repository/examination.repository";
import type {
  CreateExaminationDto,
  UpdateExaminationDto,
} from "@repo/shared/schemas/examination.schema";
import { PrismaService } from "../prisma/prisma.service";

interface ExaminationUser {
  sub: string;
}
interface ExaminationQueryInput
  extends Omit<ExaminationSearchInput, "dateFrom" | "dateTo"> {
  page: number;
  limit: number;
  dateFrom?: string | Date | undefined;
  dateTo?: string | Date | undefined;
}

function prismaCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error))
    return null;
  const code = error.code;
  return typeof code === "string" ? code : null;
}

@Injectable()
export class ExaminationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ExaminationRepository,
  ) {}

  async create(
    data: CreateExaminationDto,
    user: ExaminationUser,
  ): Promise<ExaminationResponse> {
    const institutionId = await this.institutionIdFor(user.sub);
    await this.requireClassSubject(data.classSubjectId, institutionId);
    if (data.assignmentTypeId !== undefined)
      await this.requireAssignmentType(data.assignmentTypeId);
    try {
      return await this.repository.create({
        createdBy: user.sub,
        classSubjectId: data.classSubjectId,
        ...(data.assignmentTypeId !== undefined && {
          assignmentTypeId: data.assignmentTypeId,
        }),
        title: data.title,
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.examinationDate !== undefined && {
          examinationDate: new Date(data.examinationDate),
        }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.maximumScore !== undefined && {
          maximumScore: data.maximumScore,
        }),
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async findAll(
    query: ExaminationQueryInput,
    user: ExaminationUser,
  ): Promise<ExaminationPaginationResult> {
    const institutionId = await this.institutionIdFor(user.sub);
    const filters: ExaminationSearchInput & { institutionId: string } = {
      institutionId,
      ...(query.search !== undefined && { search: query.search }),
      ...(query.classSubjectId !== undefined && {
        classSubjectId: query.classSubjectId,
      }),
      ...(query.assignmentTypeId !== undefined && {
        assignmentTypeId: query.assignmentTypeId,
      }),
      ...(query.dateFrom !== undefined && {
        dateFrom: new Date(query.dateFrom),
      }),
      ...(query.dateTo !== undefined && { dateTo: new Date(query.dateTo) }),
    };
    return this.repository.findAll(query.page, query.limit, filters);
  }

  async stats(user: ExaminationUser): Promise<ExaminationStats> {
    return this.repository.stats(await this.institutionIdFor(user.sub));
  }

  async findById(
    id: string,
    user: ExaminationUser,
  ): Promise<ExaminationResponse> {
    const examination = await this.repository.findById(
      id,
      await this.institutionIdFor(user.sub),
    );
    if (!examination) throw new NotFoundException("Ujian tidak ditemukan.");
    return examination;
  }

  async update(
    id: string,
    data: UpdateExaminationDto,
    user: ExaminationUser,
  ): Promise<ExaminationResponse> {
    const institutionId = await this.institutionIdFor(user.sub);
    const current = await this.repository.findById(id, institutionId);
    if (!current) throw new NotFoundException("Ujian tidak ditemukan.");
    const classSubjectId = data.classSubjectId ?? current.classSubjectId;
    if (!classSubjectId)
      throw new NotFoundException("Mata pelajaran kelas tidak ditemukan.");
    await this.requireClassSubject(classSubjectId, institutionId);
    if (data.assignmentTypeId !== undefined)
      await this.requireAssignmentType(data.assignmentTypeId);
    try {
      return await this.repository.update(id, {
        updatedBy: user.sub,
        ...(data.classSubjectId !== undefined && {
          classSubjectId: data.classSubjectId,
        }),
        ...(data.assignmentTypeId !== undefined && {
          assignmentTypeId: data.assignmentTypeId,
        }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.examinationDate !== undefined && {
          examinationDate: new Date(data.examinationDate),
        }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.maximumScore !== undefined && {
          maximumScore: data.maximumScore,
        }),
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async softDelete(
    id: string,
    user: ExaminationUser,
  ): Promise<ExaminationResponse> {
    const institutionId = await this.institutionIdFor(user.sub);
    if (!(await this.repository.findById(id, institutionId)))
      throw new NotFoundException("Ujian tidak ditemukan.");
    try {
      return await this.repository.softDelete(id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile?.institutionId)
      throw new ForbiddenException("Akun tidak memiliki institusi.");
    return profile.institutionId;
  }

  private async requireClassSubject(id: string, institutionId: string) {
    const relation = await this.prisma.client.classSubjects.findFirst({
      where: { id, deleted_at: null, class: { institution_id: institutionId } },
      select: { id: true },
    });
    if (!relation)
      throw new NotFoundException("Mata pelajaran kelas tidak ditemukan.");
  }

  private async requireAssignmentType(id: string) {
    const assignmentType = await this.prisma.client.assignmentTypes.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });
    if (!assignmentType)
      throw new NotFoundException("Jenis tugas tidak ditemukan.");
  }

  private mapPrismaError(error: unknown): Error {
    const code = prismaCode(error);
    if (code === "P2002") return new ConflictException("Data ujian sudah ada.");
    if (code === "P2003")
      return new BadRequestException("Relasi data ujian tidak valid.");
    return error instanceof Error
      ? error
      : new BadRequestException("Operasi ujian gagal.");
  }
}
