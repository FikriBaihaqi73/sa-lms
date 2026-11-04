import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type JournalScope,
  TeachingJournalRepository,
} from "@repo/shared/infrastructure/repository/journals.repository";
import type {
  CreateTeachingJournalDto,
  UpdateTeachingJournalDto,
} from "@repo/shared/schemas/teaching-journal.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TeachingJournalService {
  private readonly repository: TeachingJournalRepository;
  constructor(private readonly prisma: PrismaService) {
    this.repository = new TeachingJournalRepository(prisma.client);
  }

  private async scope(userId: string, write = false): Promise<JournalScope> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null, institution: { deletedAt: null } },
      select: {
        institutionId: true,
        role: { select: { name: true } },
        teacher: { select: { id: true, deleted_at: true } },
      },
    });
    const role = profile?.role.name.trim().toLowerCase();
    if (
      !profile?.institutionId ||
      (role !== "admin" && role !== "teacher") ||
      (write && role !== "teacher")
    ) {
      throw new ForbiddenException("Institution access is required");
    }
    if (role === "teacher") {
      if (!profile.teacher || profile.teacher.deleted_at)
        throw new ForbiddenException("Institution access is required");
      return {
        institutionId: profile.institutionId,
        teacherId: profile.teacher.id,
      };
    }
    return { institutionId: profile.institutionId };
  }

  async findAll(
    page: number,
    limit: number,
    filters:
      | {
          search?: string | undefined;
          schedule_id?: string | undefined;
          journal_date?: string | undefined;
        }
      | undefined,
    userId: string,
  ) {
    return this.repository.findAll(
      page,
      limit,
      filters,
      await this.scope(userId),
    );
  }
  async findOne(id: string, userId: string) {
    const journal = await this.repository.findById(
      id,
      await this.scope(userId),
    );
    if (!journal) throw new NotFoundException("Teaching journal not found");
    return journal;
  }
  async create(dto: CreateTeachingJournalDto, userId: string) {
    const scope = await this.scope(userId, true);
    const { journal_date, ...fields } = dto;
    const result = await this.repository.create(
      {
        ...fields,
        ...(journal_date !== undefined
          ? { journal_date: new Date(journal_date) }
          : {}),
      },
      scope,
      userId,
    );
    if (!result) throw new NotFoundException("Schedule not found");
    return result;
  }
  async update(id: string, dto: UpdateTeachingJournalDto, userId: string) {
    const scope = await this.scope(userId, true);
    const { journal_date, ...fields } = dto;
    const result = await this.repository.update(
      id,
      {
        ...fields,
        ...(journal_date !== undefined
          ? { journal_date: new Date(journal_date) }
          : {}),
      },
      scope,
      userId,
    );
    if (!result)
      throw new NotFoundException("Teaching journal or schedule not found");
    return result;
  }
  async remove(id: string, userId: string) {
    const scope = await this.scope(userId, true);
    if (!(await this.repository.delete(id, scope, userId)))
      throw new NotFoundException("Teaching journal not found");
    return { success: true, id };
  }
}
