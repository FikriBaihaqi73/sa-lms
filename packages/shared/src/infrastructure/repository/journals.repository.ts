import type { Prisma, PrismaClient } from "#generated/client";
import {
  type TeachingJournalEntity,
  teachingJournalSelect,
} from "#selects/journals.select";

export interface CreateTeachingJournalInput {
  schedule_id: string;
  meeting_number?: number | undefined;
  journal_date?: Date | undefined;
  topic?: string | undefined;
  material?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateTeachingJournalInput {
  schedule_id?: string | undefined;
  meeting_number?: number | undefined;
  journal_date?: Date | undefined;
  topic?: string | undefined;
  material?: string | undefined;
  notes?: string | undefined;
}

export interface TeachingJournalSearchInput {
  search?: string | undefined;
  schedule_id?: string | undefined;
  journal_date?: string | undefined;
}

export interface JournalScope {
  institutionId: string;
  teacherId?: string;
}

function scheduleScope(scope: JournalScope): Prisma.ScheduleWhereInput {
  return {
    deletedAt: null,
    classroom: { institutionId: scope.institutionId, deletedAt: null },
    classSubject: {
      deleted_at: null,
      class: { institution_id: scope.institutionId, deleted_at: null },
      ...(scope.teacherId ? { teacher_id: scope.teacherId } : {}),
    },
  };
}

export class TeachingJournalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    data: CreateTeachingJournalInput,
    scope: JournalScope,
    userId: string,
  ): Promise<TeachingJournalEntity | null> {
    return this.prisma.$transaction(
      async (tx) => {
        const schedule = await tx.schedule.findFirst({
          where: { id: data.schedule_id, ...scheduleScope(scope) },
          select: { id: true },
        });
        if (!schedule) return null;
        return tx.teachingJournals.create({
          data: {
            created_by: userId,
            schedule_id: data.schedule_id,
            meeting_number: data.meeting_number ?? null,
            journal_date: data.journal_date ?? null,
            topic: data.topic ?? null,
            material: data.material ?? null,
            notes: data.notes ?? null,
          },
          select: teachingJournalSelect,
        });
      },
      { isolationLevel: "Serializable" },
    );
  }

  async findById(
    id: string,
    scope: JournalScope,
    ownerId?: string,
  ): Promise<TeachingJournalEntity | null> {
    return this.prisma.teachingJournals.findFirst({
      where: {
        id,
        deleted_at: null,
        schedule: scheduleScope(scope),
        ...(ownerId ? { created_by: ownerId } : {}),
      },
      select: teachingJournalSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters: TeachingJournalSearchInput | undefined,
    scope: JournalScope,
  ): Promise<{
    data: TeachingJournalEntity[];
    meta: {
      totalData: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const where: Prisma.TeachingJournalsWhereInput = {
      schedule: scheduleScope(scope),
      deleted_at: null,
      ...(filters?.search
        ? {
            OR: [
              { topic: { contains: filters.search, mode: "insensitive" } },
              { material: { contains: filters.search, mode: "insensitive" } },
              { notes: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters?.schedule_id ? { schedule_id: filters.schedule_id } : {}),
      ...(filters?.journal_date
        ? { journal_date: new Date(filters.journal_date) }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.teachingJournals.findMany({
        where,
        skip,
        take: limit,
        select: teachingJournalSelect,
        orderBy: {
          created_at: "desc",
        },
      }),
      this.prisma.teachingJournals.count({
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
    data: UpdateTeachingJournalInput,
    scope: JournalScope,
    userId: string,
  ): Promise<TeachingJournalEntity | null> {
    return this.prisma.$transaction(
      async (tx) => {
        if (data.schedule_id) {
          const schedule = await tx.schedule.findFirst({
            where: { id: data.schedule_id, ...scheduleScope(scope) },
            select: { id: true },
          });
          if (!schedule) return null;
        }
        const result = await tx.teachingJournals.updateMany({
          where: {
            id,
            deleted_at: null,
            ...(scope.teacherId ? { created_by: userId } : {}),
            schedule: scheduleScope(scope),
          },
          data: {
            updated_by: userId,
            ...(data.schedule_id !== undefined && {
              schedule_id: data.schedule_id,
            }),
            ...(data.meeting_number !== undefined && {
              meeting_number: data.meeting_number,
            }),
            ...(data.journal_date !== undefined && {
              journal_date: data.journal_date,
            }),
            ...(data.topic !== undefined && {
              topic: data.topic,
            }),
            ...(data.material !== undefined && {
              material: data.material,
            }),
            ...(data.notes !== undefined && {
              notes: data.notes,
            }),
          },
        });
        if (!result.count) return null;
        return tx.teachingJournals.findFirst({
          where: {
            id,
            deleted_at: null,
            ...(scope.teacherId ? { created_by: userId } : {}),
            schedule: scheduleScope(scope),
          },
          select: teachingJournalSelect,
        });
      },
      { isolationLevel: "Serializable" },
    );
  }

  async delete(
    id: string,
    scope: JournalScope,
    userId: string,
  ): Promise<boolean> {
    const result = await this.prisma.teachingJournals.updateMany({
      where: {
        id,
        deleted_at: null,
        ...(scope.teacherId ? { created_by: userId } : {}),
        schedule: scheduleScope(scope),
      },
      data: {
        updated_by: userId,
        deleted_at: new Date(),
      },
    });
    return result.count > 0;
  }
}
