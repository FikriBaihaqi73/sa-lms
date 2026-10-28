import type { SubjectEntity } from "#entities/subject.entity";
import type { Prisma, PrismaClient } from "#generated/client";
import { subjectSelect } from "#selects/subject.select";

export interface CreateSubjectInput {
  code: string;
  name: string;
  credits?: number | undefined;
  description?: string | undefined;
  institutionId: string;
  departmentId?: string | undefined;
}

export interface UpdateSubjectInput {
  code?: string | undefined;
  name?: string | undefined;
  credits?: number | undefined;
  description?: string | undefined;
  institutionId?: string | undefined;
  departmentId?: string | undefined;
}

export class SubjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSubjectInput): Promise<SubjectEntity> {
    return this.prisma.subject.create({
      data: {
        code: data.code,
        name: data.name,
        credits: data.credits ?? null,
        description: data.description ?? null,
        institutionId: data.institutionId,
        departmentId: data.departmentId ?? null,
      },
      select: subjectSelect,
    });
  }

  async findById(id: string, institutionId?: string): Promise<SubjectEntity | null> {
    return this.prisma.subject.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(institutionId !== undefined ? { institutionId } : {}),
      },
      select: subjectSelect,
    });
  }

  async findByCode(code: string, institutionId?: string): Promise<SubjectEntity | null> {
    return this.prisma.subject.findFirst({
      where: {
        code,
        deletedAt: null,
        ...(institutionId !== undefined ? { institutionId } : {}),
      },
      select: subjectSelect,
    });
  }

  async findAll(params?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    institutionId?: string | undefined;
    departmentId?: string | undefined;
  }): Promise<{ data: SubjectEntity[]; total: number }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SubjectWhereInput = {
      deletedAt: null,
      ...(params?.search && {
        OR: [
          { code: { contains: params.search, mode: "insensitive" } },
          { name: { contains: params.search, mode: "insensitive" } },
        ],
      }),
      ...(params?.institutionId && { institutionId: params.institutionId }),
      ...(params?.departmentId && { departmentId: params.departmentId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
        select: subjectSelect,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateSubjectInput): Promise<SubjectEntity> {
    return this.prisma.subject.update({
      where: { id },
      data: {
        ...(data.code !== undefined && {
          code: data.code,
        }),
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.credits !== undefined && {
          credits: data.credits,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.institutionId !== undefined && {
          institutionId: data.institutionId,
        }),
        ...(data.departmentId !== undefined && {
          departmentId: data.departmentId,
        }),
      },
      select: subjectSelect,
    });
  }

  async delete(id: string): Promise<SubjectEntity> {
    return this.prisma.subject.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      select: subjectSelect,
    });
  }
}
