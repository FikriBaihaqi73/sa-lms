import type { Prisma, PrismaClient } from "#generated/client";
import {
  type ExaminationEntity,
  examinationSelect,
} from "#selects/examination.select";

export interface CreateExaminationInput {
  createdBy: string;
  classSubjectId: string;
  assignmentTypeId?: string;
  title: string;
  description?: string;
  examinationDate?: Date;
  duration?: number;
  maximumScore?: number;
}

export interface UpdateExaminationInput {
  updatedBy?: string;
  classSubjectId?: string;
  assignmentTypeId?: string;
  title?: string;
  description?: string;
  examinationDate?: Date;
  duration?: number;
  maximumScore?: number;
}

export interface ExaminationSearchInput {
  search?: string | undefined;
  classSubjectId?: string | undefined;
  assignmentTypeId?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
}

export interface ExaminationStats {
  total: number;
  upcoming: number;
  completed: number;
  withoutDate: number;
}

export interface ExaminationResponse
  extends Omit<ExaminationEntity, "maximumScore"> {
  maximumScore: number | null;
}

export interface ExaminationPaginationResult {
  data: ExaminationResponse[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export class ExaminationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateExaminationInput): Promise<ExaminationResponse> {
    const result = await this.prisma.examinations.create({
      data: {
        title: data.title,

        createdBy: data.createdBy,

        classSubjectId: data.classSubjectId,

        ...(data.assignmentTypeId !== undefined && {
          assignmentTypeId: data.assignmentTypeId,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.examinationDate !== undefined && {
          examinationDate: data.examinationDate,
        }),

        ...(data.duration !== undefined && {
          duration: data.duration,
        }),

        ...(data.maximumScore !== undefined && {
          maximumScore: data.maximumScore,
        }),
      },
      select: examinationSelect,
    });
    return this.toResponse(result);
  }

  async findById(
    id: string,
    institutionId: string,
  ): Promise<ExaminationResponse | null> {
    const result = await this.prisma.examinations.findFirst({
      where: {
        id,
        deletedAt: null,
        classSubject: { class: { institution_id: institutionId } },
      },
      select: examinationSelect,
    });
    return result ? this.toResponse(result) : null;
  }

  async findAll(
    page = 1,
    limit = 10,
    filters: ExaminationSearchInput & { institutionId: string },
  ): Promise<ExaminationPaginationResult> {
    const currentPage = Math.max(Math.floor(page || 1), 1);
    const perPage = Math.min(Math.max(Math.floor(limit || 10), 1), 100);
    const search = filters?.search?.trim();

    const where: Prisma.ExaminationsWhereInput = {
      deletedAt: null,
      classSubject: { class: { institution_id: filters.institutionId } },
      ...(filters.classSubjectId
        ? { classSubjectId: filters.classSubjectId }
        : {}),
      ...(filters.assignmentTypeId
        ? { assignmentTypeId: filters.assignmentTypeId }
        : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            examinationDate: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.examinations.findMany({
        where,
        skip: (currentPage - 1) * perPage,
        take: perPage,
        select: examinationSelect,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.examinations.count({ where }),
    ]);

    return {
      data: data.map((item) => this.toResponse(item)),
      meta: {
        totalData,
        totalPages: Math.ceil(totalData / perPage),
        currentPage,
        perPage,
      },
    };
  }

  async stats(institutionId: string): Promise<ExaminationStats> {
    const now = new Date();
    const scope: Prisma.ExaminationsWhereInput = {
      deletedAt: null,
      classSubject: { class: { institution_id: institutionId } },
    };
    const [total, upcoming, completed, withoutDate] = await Promise.all([
      this.prisma.examinations.count({ where: scope }),
      this.prisma.examinations.count({
        where: { ...scope, examinationDate: { gte: now } },
      }),
      this.prisma.examinations.count({
        where: { ...scope, examinationDate: { lt: now } },
      }),
      this.prisma.examinations.count({
        where: { ...scope, examinationDate: null },
      }),
    ]);
    return { total, upcoming, completed, withoutDate };
  }

  async update(
    id: string,
    data: UpdateExaminationInput,
  ): Promise<ExaminationResponse> {
    const result = await this.prisma.examinations.update({
      where: {
        id,
      },
      data: {
        ...(data.updatedBy !== undefined && {
          updatedBy: data.updatedBy,
        }),

        ...(data.classSubjectId !== undefined && {
          classSubjectId: data.classSubjectId,
        }),

        ...(data.assignmentTypeId !== undefined && {
          assignmentTypeId: data.assignmentTypeId,
        }),

        ...(data.title !== undefined && {
          title: data.title,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.examinationDate !== undefined && {
          examinationDate: data.examinationDate,
        }),

        ...(data.duration !== undefined && {
          duration: data.duration,
        }),

        ...(data.maximumScore !== undefined && {
          maximumScore: data.maximumScore,
        }),
      },
      select: examinationSelect,
    });
    return this.toResponse(result);
  }

  async softDelete(id: string): Promise<ExaminationResponse> {
    const result = await this.prisma.examinations.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: examinationSelect,
    });
    return this.toResponse(result);
  }

  private toResponse(examination: ExaminationEntity): ExaminationResponse {
    return {
      ...examination,
      maximumScore:
        examination.maximumScore == null
          ? null
          : Number(examination.maximumScore),
    };
  }
}
