import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AnnouncementsRepository,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from "@repo/shared/infrastructure/repository/announcements.repository";
import { InstitutionRepository } from "@repo/shared/infrastructure/repository/institution.repository";
import type {
  CreateAnnouncementDto,
  QueryAnnouncementDto,
  UpdateAnnouncementDto,
} from "@repo/shared/schemas/announcement.schema";
import {
  formatAnnouncementContent,
  parseAnnouncementContent,
} from "@repo/shared/utils/announcement-content";
import { PrismaService } from "../prisma/prisma.service";

interface AuthenticatedUser {
  sub: string;
}

@Injectable()
export class AnnouncementService {
  private readonly announcementRepository: AnnouncementsRepository;
  private readonly institutionRepository: InstitutionRepository;

  constructor(private readonly prisma: PrismaService) {
    this.announcementRepository = new AnnouncementsRepository(
      this.prisma.client,
    );
    this.institutionRepository = new InstitutionRepository(this.prisma.client);
  }

  private async institutionIdFor(userId: string): Promise<string> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true },
    });
    if (!profile?.institutionId) {
      throw new ForbiddenException("Akun tidak memiliki institusi.");
    }
    return profile.institutionId;
  }

  private transformAnnouncement<T extends { content?: string | null }>(
    item: T,
  ) {
    const parsed = parseAnnouncementContent(item.content);
    return {
      ...item,
      targetAudience: parsed.targetAudience,
      category: parsed.category,
      contentBody: parsed.body,
    };
  }

  async findAll(query?: QueryAnnouncementDto, user?: AuthenticatedUser) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const institutionId = user
      ? await this.institutionIdFor(user.sub)
      : query?.institutionId;

    const result = await this.announcementRepository.findAll(page, limit, {
      search: query?.search,
      institution_id: institutionId,
      is_published: query?.isPublished,
    });

    let transformedData = result.data.map((item) =>
      this.transformAnnouncement(item),
    );

    if (query?.targetAudience) {
      transformedData = transformedData.filter(
        (a) => a.targetAudience === query.targetAudience,
      );
    }

    if (query?.category) {
      transformedData = transformedData.filter(
        (a) => a.category === query.category,
      );
    }

    return {
      data: transformedData,
      meta: {
        ...result.meta,
        totalData:
          query?.targetAudience || query?.category
            ? transformedData.length
            : result.meta.totalData,
      },
    };
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const institutionId = user
      ? await this.institutionIdFor(user.sub)
      : undefined;

    const announcement = await this.announcementRepository.findById(
      id,
      institutionId,
    );

    if (!announcement) {
      throw new NotFoundException("Pengumuman tidak ditemukan.");
    }

    return this.transformAnnouncement(announcement);
  }

  async create(dto: CreateAnnouncementDto, user?: AuthenticatedUser) {
    const institutionId = user
      ? await this.institutionIdFor(user.sub)
      : dto.institutionId;

    if (!institutionId) {
      throw new ForbiddenException("Institusi harus disertakan.");
    }

    await this.ensureInstitutionExists(institutionId);

    const formattedContent = formatAnnouncementContent(
      dto.content ?? "",
      dto.targetAudience ?? "ALL",
      dto.category ?? "GENERAL",
    );

    const isPublished = dto.isPublished ?? false;
    let publishedAt: Date | null = null;
    if (dto.publishedAt) {
      publishedAt = new Date(dto.publishedAt);
    } else if (isPublished) {
      publishedAt = new Date();
    }

    const input: CreateAnnouncementInput = {
      institution_id: institutionId,
      title: dto.title,
      content: formattedContent,
      is_published: isPublished,
      published_at: publishedAt,
      expired_at: dto.expiredAt ? new Date(dto.expiredAt) : null,
      created_by: user?.sub ?? null,
    };

    const created = await this.announcementRepository.create(input);
    return this.transformAnnouncement(created);
  }

  async update(
    id: string,
    dto: UpdateAnnouncementDto,
    user?: AuthenticatedUser,
  ) {
    const existing = await this.findOne(id, user);

    let institutionId: string | undefined;
    if (dto.institutionId !== undefined) {
      await this.ensureInstitutionExists(dto.institutionId);
      institutionId = dto.institutionId;
    }

    let formattedContent: string | undefined;
    if (
      dto.content !== undefined ||
      dto.targetAudience !== undefined ||
      dto.category !== undefined
    ) {
      const parsed = parseAnnouncementContent(existing.content);
      const newBody = dto.content !== undefined ? dto.content : parsed.body;
      const newAudience =
        dto.targetAudience !== undefined
          ? dto.targetAudience
          : parsed.targetAudience;
      const newCategory =
        dto.category !== undefined ? dto.category : parsed.category;
      formattedContent = formatAnnouncementContent(
        newBody,
        newAudience,
        newCategory,
      );
    }

    let publishedAt: Date | null | undefined;
    if (dto.publishedAt !== undefined) {
      publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    } else if (dto.isPublished === true && !existing.published_at) {
      publishedAt = new Date();
    }

    const input: UpdateAnnouncementInput = {
      ...(institutionId !== undefined && { institution_id: institutionId }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(formattedContent !== undefined && { content: formattedContent }),
      ...(dto.isPublished !== undefined && { is_published: dto.isPublished }),
      ...(publishedAt !== undefined && { published_at: publishedAt }),
      ...(dto.expiredAt !== undefined && {
        expired_at: dto.expiredAt ? new Date(dto.expiredAt) : null,
      }),
      ...(user?.sub !== undefined && { updated_by: user.sub }),
    };

    const updated = await this.announcementRepository.update(id, input);
    return this.transformAnnouncement(updated);
  }

  async remove(id: string, user?: AuthenticatedUser) {
    await this.findOne(id, user);
    await this.announcementRepository.delete(id, user?.sub);
    return { success: true, id };
  }

  async stats(user: AuthenticatedUser) {
    const institutionId = await this.institutionIdFor(user.sub);
    const all =
      await this.announcementRepository.findByInstitutionId(institutionId);

    const now = new Date();
    const total = all.length;
    const published = all.filter((a) => a.is_published).length;
    const draft = all.filter((a) => !a.is_published).length;
    const active = all.filter((a) => {
      if (!a.is_published) return false;
      if (!a.expired_at) return true;
      return new Date(a.expired_at) > now;
    }).length;

    return {
      total,
      published,
      draft,
      active,
    };
  }

  private async ensureInstitutionExists(institutionId: string) {
    const institution =
      await this.institutionRepository.findById(institutionId);
    if (!institution) {
      throw new NotFoundException("Institusi tidak ditemukan.");
    }
  }
}
