import type { Prisma, PrismaClient } from "#generated/client";
import { type ScheduleEntity, scheduleSelect } from "#selects/schedule.select";

export interface CreateScheduleInput {
  classSubjectId: string;
  classroomId: string;
  day: string;
  startTime?: Date | null | undefined;
  endTime?: Date | null | undefined;
}

export interface UpdateScheduleInput {
  classSubjectId?: string | undefined;
  classroomId?: string | undefined;
  day?: string | undefined;
  startTime?: Date | null | undefined;
  endTime?: Date | null | undefined;
}

export interface ScheduleSearchInput {
  search?: string | undefined;
  day?: string | undefined;
  classroomId?: string | undefined;
  classSubjectId?: string | undefined;
}

export class ScheduleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateScheduleInput): Promise<ScheduleEntity> {
    return this.prisma.schedule.create({
      data: {
        classSubjectId: data.classSubjectId,
        classroomId: data.classroomId,
        day: data.day,
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
      },
      select: scheduleSelect,
    });
  }

  async findById(id: string): Promise<ScheduleEntity | null> {
    return this.prisma.schedule.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: scheduleSelect,
    });
  }

  async findByClassSubject(classSubjectId: string): Promise<ScheduleEntity[]> {
    return this.prisma.schedule.findMany({
      where: {
        classSubjectId,
        deletedAt: null,
      },
      select: scheduleSelect,
    });
  }

  async findByClassroom(classroomId: string): Promise<ScheduleEntity[]> {
    return this.prisma.schedule.findMany({
      where: {
        classroomId,
        deletedAt: null,
      },
      select: scheduleSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: ScheduleSearchInput,
  ): Promise<{
    data: ScheduleEntity[];
    meta: {
      totalData: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const where: Prisma.ScheduleWhereInput = {
      deletedAt: null,
      ...(filters?.day ? { day: filters.day } : {}),
      ...(filters?.classroomId ? { classroomId: filters.classroomId } : {}),
      ...(filters?.classSubjectId
        ? { classSubjectId: filters.classSubjectId }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              {
                day: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                classroom: {
                  roomName: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                classroom: {
                  roomCode: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                classSubject: {
                  subject: {
                    name: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                classSubject: {
                  class: {
                    name: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, totalData] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        select: scheduleSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.schedule.count({
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

  async update(id: string, data: UpdateScheduleInput): Promise<ScheduleEntity> {
    return this.prisma.schedule.update({
      where: {
        id,
      },
      data: {
        ...(data.classSubjectId !== undefined && {
          classSubjectId: data.classSubjectId,
        }),
        ...(data.classroomId !== undefined && {
          classroomId: data.classroomId,
        }),
        ...(data.day !== undefined && { day: data.day }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
      },
      select: scheduleSelect,
    });
  }

  async delete(id: string): Promise<ScheduleEntity> {
    return this.prisma.schedule.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: scheduleSelect,
    });
  }
}
