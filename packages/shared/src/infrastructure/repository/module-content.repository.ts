import type { Prisma, PrismaClient } from "#generated/client";
import {
  type ModuleContentEntity,
  moduleContentSelect,
} from "#selects/module-content.select";

export interface CreateModuleContentInput {
  moduleId: string;
  title: string;
  contentType: string;
  content?: string | undefined;
  fileId?: string | undefined;
  sortOrder?: number | undefined;
}

export interface UpdateModuleContentInput {
  moduleId?: string | undefined;
  title?: string | undefined;
  contentType?: string | undefined;
  content?: string | undefined;
  fileId?: string | undefined;
  sortOrder?: number | undefined;
}

export interface ModuleContentSearchInput {
  search?: string | undefined;
  moduleId?: string | undefined;
  contentType?: string | undefined;
}

export class ModuleContentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateModuleContentInput): Promise<ModuleContentEntity> {
    return this.prisma.moduleContent.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        contentType: data.contentType,
        ...(data.content !== undefined && { content: data.content }),
        ...(data.fileId !== undefined && { fileId: data.fileId }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      select: moduleContentSelect,
    });
  }

  async findById(id: string): Promise<ModuleContentEntity | null> {
    return this.prisma.moduleContent.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: moduleContentSelect,
    });
  }

  async findByModuleId(moduleId: string): Promise<ModuleContentEntity[]> {
    return this.prisma.moduleContent.findMany({
      where: {
        moduleId,
        deletedAt: null,
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: moduleContentSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: ModuleContentSearchInput,
  ): Promise<{
    data: ModuleContentEntity[];
    meta: {
      totalData: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(filters?.moduleId ? { moduleId: filters.moduleId } : {}),
      ...(filters?.contentType ? { contentType: filters.contentType } : {}),
      ...(filters?.search
        ? {
            title: {
              contains: filters.search,
              mode: "insensitive",
            },
          }
        : {}),
    } satisfies Prisma.ModuleContentWhereInput;

    const [data, totalData] = await Promise.all([
      this.prisma.moduleContent.findMany({
        where,
        skip,
        take: limit,
        select: moduleContentSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.moduleContent.count({
        where,
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

  async update(
    id: string,
    data: UpdateModuleContentInput,
  ): Promise<ModuleContentEntity> {
    return this.prisma.moduleContent.update({
      where: {
        id,
      },
      data: {
        ...(data.moduleId !== undefined && { moduleId: data.moduleId }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.contentType !== undefined && {
          contentType: data.contentType,
        }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.fileId !== undefined && { fileId: data.fileId }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      select: moduleContentSelect,
    });
  }

  async delete(id: string): Promise<ModuleContentEntity> {
    return this.prisma.moduleContent.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: moduleContentSelect,
    });
  }
}
