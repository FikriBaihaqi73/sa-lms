import type { PrismaClient } from "#generated/client";
import {
  type SpecializationEntity,
  specializationSelect,
} from "#selects/specialization.select";

export interface CreateSpecializationInput {
  name: string;
  description?: string | null | undefined;
}

export interface UpdateSpecializationInput {
  name?: string | undefined;
  description?: string | null | undefined;
}

export class SpecializationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSpecializationInput): Promise<SpecializationEntity> {
    return this.prisma.specializations.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
      select: specializationSelect,
    });
  }

  async findById(id: string): Promise<SpecializationEntity | null> {
    return this.prisma.specializations.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: specializationSelect,
    });
  }

  async findByName(name: string): Promise<SpecializationEntity | null> {
    return this.prisma.specializations.findFirst({
      where: {
        name,
        deleted_at: null,
      },
      select: specializationSelect,
    });
  }

  async findAll(): Promise<SpecializationEntity[]> {
    return this.prisma.specializations.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "asc",
      },
      select: specializationSelect,
    });
  }

  async update(
    id: string,
    data: UpdateSpecializationInput,
  ): Promise<SpecializationEntity> {
    return this.prisma.specializations.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
      },
      select: specializationSelect,
    });
  }

  async delete(id: string): Promise<SpecializationEntity> {
    return this.prisma.specializations.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
      select: specializationSelect,
    });
  }
}

