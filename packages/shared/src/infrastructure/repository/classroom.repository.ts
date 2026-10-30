import type { Prisma, PrismaClient } from "#generated/client";
import {
  type ClassroomEntity,
  classroomSelect,
} from "#selects/classroom.select";

export interface CreateClassroomInput {
  institutionId: string;
  roomCode: string;
  roomName: string;
  building?: string;
  floor?: number;
  capacity?: number;
  description?: string;
}

export interface UpdateClassroomInput {
  institutionId?: string;
  roomCode?: string;
  roomName?: string;
  building?: string;
  floor?: number;
  capacity?: number;
  description?: string;
}

export interface ClassroomSearchInput {
  search?: string | undefined;
}

export class ClassroomRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateClassroomInput): Promise<ClassroomEntity> {
    return this.prisma.classroom.create({
      data: {
        institutionId: data.institutionId,
        roomCode: data.roomCode,
        roomName: data.roomName,
        ...(data.building !== undefined && { building: data.building }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
      select: classroomSelect,
    });
  }

  async findById(id: string, institutionId?: string): Promise<ClassroomEntity | null> {
    return this.prisma.classroom.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(institutionId ? { institutionId } : {}),
      },
      select: classroomSelect,
    });
  }

  async findByRoomCode(roomCode: string): Promise<ClassroomEntity | null> {
    return this.prisma.classroom.findFirst({
      where: {
        roomCode,
        deletedAt: null,
      },
      select: classroomSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: ClassroomSearchInput,
    institutionId?: string,
  ): Promise<{
    data: ClassroomEntity[];
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
      ...(institutionId ? { institutionId } : {}),
      ...(filters?.search
        ? {
            OR: [
              {
                roomName: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                roomCode: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    } satisfies Prisma.ClassroomWhereInput;

    const [data, totalData] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        skip,
        take: limit,
        select: classroomSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.classroom.count({
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
    data: UpdateClassroomInput,
  ): Promise<ClassroomEntity> {
    return this.prisma.classroom.update({
      where: {
        id,
      },
      data: {
        ...(data.institutionId !== undefined && {
          institutionId: data.institutionId,
        }),
        ...(data.roomCode !== undefined && { roomCode: data.roomCode }),
        ...(data.roomName !== undefined && { roomName: data.roomName }),
        ...(data.building !== undefined && { building: data.building }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
      select: classroomSelect,
    });
  }

  async delete(id: string): Promise<ClassroomEntity> {
    return this.prisma.classroom.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: classroomSelect,
    });
  }
}
