import { type SettingEntity } from "#entities/setting.entity";
import type { Prisma, PrismaClient } from "#generated/client";
import { settingsSelect } from "#selects/settings.select";

export interface CreateSettingInput {
  settingKey: string;
  settingValue?: string | null;
  description?: string | null;
  updatedBy?: string | null;
}

export interface UpdateSettingInput {
  settingKey?: string;
  settingValue?: string | null;
  description?: string | null;
  updatedBy?: string | null;
}

export interface SettingSearchInput {
  search?: string | undefined;
}

export class SettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSettingInput): Promise<SettingEntity> {
    return this.prisma.settings.create({
      data: {
        settingKey: data.settingKey,
        ...(data.settingValue !== undefined && {
          settingValue: data.settingValue,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.updatedBy !== undefined && {
          updatedBy: data.updatedBy,
        }),
      },
      select: settingsSelect,
    });
  }

  async findById(id: string): Promise<SettingEntity | null> {
    return this.prisma.settings.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: settingsSelect,
    });
  }

  async findByKey(settingKey: string): Promise<SettingEntity | null> {
    return this.prisma.settings.findFirst({
      where: {
        settingKey,
        deletedAt: null,
      },
      select: settingsSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: SettingSearchInput,
  ): Promise<{
    data: SettingEntity[];
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
      ...(filters?.search
        ? {
            OR: [
              {
                settingKey: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                settingValue: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    } satisfies Prisma.SettingsWhereInput;

    const [data, totalData] = await Promise.all([
      this.prisma.settings.findMany({
        where,
        skip,
        take: limit,
        select: settingsSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.settings.count({
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

  async update(id: string, data: UpdateSettingInput): Promise<SettingEntity> {
    return this.prisma.settings.update({
      where: {
        id,
      },
      data: {
        ...(data.settingKey !== undefined && {
          settingKey: data.settingKey,
        }),
        ...(data.settingValue !== undefined && {
          settingValue: data.settingValue,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.updatedBy !== undefined && {
          updatedBy: data.updatedBy,
        }),
      },
      select: settingsSelect,
    });
  }

  async delete(id: string): Promise<SettingEntity> {
    return this.prisma.settings.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: settingsSelect,
    });
  }
}
