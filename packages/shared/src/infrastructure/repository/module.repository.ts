import type { Prisma, PrismaClient } from "#generated/client";
import { type ModuleEntity, moduleSelect } from "#selects/module.select";

export interface CreateModuleInput {
  created_by?: string | undefined;
  class_subject_id: string;
  title: string;
  description?: string | undefined;
  display_order?: number | undefined;
  is_published?: boolean | undefined;
  is_locked?: boolean | undefined;
}

export interface UpdateModuleInput {
  updated_by?: string | undefined;
  class_subject_id?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  display_order?: number | undefined;
  is_published?: boolean | undefined;
  is_locked?: boolean | undefined;
}

export interface ModuleSearchInput {
  search?: string | undefined;
  class_subject_id?: string | undefined;
  is_published?: boolean | undefined;
  is_locked?: boolean | undefined;
}

export class ModuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateModuleInput): Promise<ModuleEntity> {
    return this.prisma.modules.create({
      data: {
        created_by: data.created_by ?? null,
        class_subject_id: data.class_subject_id,
        title: data.title,
        description: data.description ?? null,
        display_order: data.display_order ?? null,
        is_published: data.is_published ?? false,
        is_locked: data.is_locked ?? false,
      },
      select: moduleSelect,
    });
  }
  async findById(id: string): Promise<ModuleEntity | null> {
    return this.prisma.modules.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: moduleSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: ModuleSearchInput,
  ): Promise<{
    data: ModuleEntity[];
    meta: {
      totalData: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const where = {
      deleted_at: null,
      ...(filters?.class_subject_id
        ? { class_subject_id: filters.class_subject_id }
        : {}),
      ...(filters?.is_published !== undefined
        ? { is_published: filters.is_published }
        : {}),
      ...(filters?.is_locked !== undefined
        ? { is_locked: filters.is_locked }
        : {}),
      ...(filters?.search
        ? {
            title: {
              contains: filters.search,
              mode: "insensitive",
            },
          }
        : {}),
    } satisfies Prisma.ModulesWhereInput;

    const [data, totalData] = await Promise.all([
      this.prisma.modules.findMany({
        where,
        skip,
        take: limit,
        select: moduleSelect,
        orderBy: {
          created_at: "desc",
        },
      }),
      this.prisma.modules.count({
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

  async findByClassSubjectId(
    class_subject_id: string,
  ): Promise<ModuleEntity[]> {
    return this.prisma.modules.findMany({
      where: {
        class_subject_id,
        deleted_at: null,
      },
      orderBy: {
        display_order: "asc",
      },
      select: moduleSelect,
    });
  }

  async update(id: string, data: UpdateModuleInput): Promise<ModuleEntity> {
    return this.prisma.modules.update({
      where: { id },
      data: {
        ...(data.updated_by !== undefined && {
          updated_by: data.updated_by,
        }),
        ...(data.class_subject_id !== undefined && {
          class_subject_id: data.class_subject_id,
        }),
        ...(data.title !== undefined && {
          title: data.title,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.display_order !== undefined && {
          display_order: data.display_order,
        }),
        ...(data.is_published !== undefined && {
          is_published: data.is_published,
        }),
        ...(data.is_locked !== undefined && {
          is_locked: data.is_locked,
        }),
      },
      select: moduleSelect,
    });
  }

  async delete(id: string): Promise<ModuleEntity> {
    return this.prisma.modules.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
      select: moduleSelect,
    });
  }
}
