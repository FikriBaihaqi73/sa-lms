import type { Prisma, PrismaClient } from "#generated/client";
import {
  type AnnouncementEntity,
  announcementSelect,
} from "#selects/announcements.select";

export interface CreateAnnouncementInput {
  institution_id: string;
  title: string;
  content?: string | null;
  is_published?: boolean;
  published_at?: Date | null;
  expired_at?: Date | null;
  created_by?: string | null;
}

export interface UpdateAnnouncementInput {
  institution_id?: string;
  title?: string;
  content?: string | null;
  is_published?: boolean;
  published_at?: Date | null;
  expired_at?: Date | null;
  updated_by?: string | null;
}

export interface AnnouncementSearchInput {
  search?: string | undefined;
  institution_id?: string | undefined;
  is_published?: boolean | undefined;
}

export interface AnnouncementPaginationResult {
  data: AnnouncementEntity[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export class AnnouncementsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAnnouncementInput): Promise<AnnouncementEntity> {
    return this.prisma.announcements.create({
      data: {
        institution_id: data.institution_id,
        title: data.title,
        content: data.content ?? null,
        is_published: data.is_published ?? false,
        published_at: data.published_at ?? null,
        expired_at: data.expired_at ?? null,
        created_by: data.created_by ?? null,
      },
      select: announcementSelect,
    });
  }

  async findById(
    id: string,
    institution_id?: string,
  ): Promise<AnnouncementEntity | null> {
    return this.prisma.announcements.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institution_id !== undefined && { institution_id }),
      },
      select: announcementSelect,
    });
  }

  async findByInstitutionId(
    institution_id: string,
  ): Promise<AnnouncementEntity[]> {
    return this.prisma.announcements.findMany({
      where: {
        institution_id,
        deleted_at: null,
      },
      select: announcementSelect,
    });
  }

  async findPublished(institution_id?: string): Promise<AnnouncementEntity[]> {
    return this.prisma.announcements.findMany({
      where: {
        is_published: true,
        ...(institution_id !== undefined && { institution_id }),
        deleted_at: null,
      },
      select: announcementSelect,
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: AnnouncementSearchInput,
  ): Promise<AnnouncementPaginationResult> {
    const currentPage = Math.max(Math.floor(page || 1), 1);
    const perPage = Math.min(Math.max(Math.floor(limit || 10), 1), 100);
    const search = filters?.search?.trim();
    const where: Prisma.AnnouncementsWhereInput = {
      deleted_at: null,
      ...(filters?.institution_id !== undefined && {
        institution_id: filters.institution_id,
      }),
      ...(filters?.is_published !== undefined && {
        is_published: filters.is_published,
      }),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
              {
                institution: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
              {
                creator: {
                  email: { contains: search, mode: "insensitive" },
                },
              },
              {
                creator: {
                  profile: {
                    some: {
                      fullName: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.announcements.findMany({
        where,
        skip: (currentPage - 1) * perPage,
        take: perPage,
        select: announcementSelect,
        orderBy: { created_at: "desc" },
      }),
      this.prisma.announcements.count({ where }),
    ]);

    return {
      data,
      meta: {
        totalData,
        totalPages: Math.ceil(totalData / perPage),
        currentPage,
        perPage,
      },
    };
  }

  async update(
    id: string,
    data: UpdateAnnouncementInput,
  ): Promise<AnnouncementEntity> {
    return this.prisma.announcements.update({
      where: {
        id,
      },
      data: {
        ...(data.institution_id !== undefined && {
          institution_id: data.institution_id,
        }),
        ...(data.title !== undefined && {
          title: data.title,
        }),
        ...(data.content !== undefined && {
          content: data.content,
        }),
        ...(data.is_published !== undefined && {
          is_published: data.is_published,
        }),
        ...(data.published_at !== undefined && {
          published_at: data.published_at,
        }),
        ...(data.expired_at !== undefined && {
          expired_at: data.expired_at,
        }),
        ...(data.updated_by !== undefined && {
          updated_by: data.updated_by,
        }),
      },
      select: announcementSelect,
    });
  }

  async delete(id: string, deleted_by?: string): Promise<AnnouncementEntity> {
    return this.prisma.announcements.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
        ...(deleted_by !== undefined && {
          deleted_by,
        }),
      },
      select: announcementSelect,
    });
  }
}

export const AnnouncementRepository = AnnouncementsRepository;
