import type { Prisma, PrismaClient } from "#generated/client";
import {
  type DepartmentEntity,
  departmentSelect,
} from "#selects/departments.select";

export interface CreateDepartmentInput {
  name: string;
  code: string;
  institution_id?: string | null | undefined;
  teacher_ids?: string[] | undefined;
}

export interface UpdateDepartmentInput {
  name?: string | undefined;
  code?: string | undefined;
  institution_id?: string | null | undefined;
  teacher_ids?: string[] | undefined;
}

export interface DepartmentSearchInput {
  search?: string | undefined;
  institution_id?: string | undefined;
}

export class DepartmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateDepartmentInput): Promise<DepartmentEntity> {
    const department = await this.prisma.departments.create({
      data: {
        name: data.name,
        code: data.code,
        ...(data.institution_id !== undefined && {
          institution_id: data.institution_id,
        }),
      },
      select: departmentSelect,
    });

    if (data.teacher_ids && data.teacher_ids.length > 0) {
      await this.prisma.teachers.updateMany({
        where: {
          id: { in: data.teacher_ids },
          deleted_at: null,
        },
        data: {
          department_id: department.id,
        },
      });

      return (await this.findById(department.id)) ?? department;
    }

    return department;
  }

  async findById(
    id: string,
    institution_id?: string,
  ): Promise<DepartmentEntity | null> {
    return this.prisma.departments.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institution_id !== undefined && { institution_id }),
      },
      select: departmentSelect,
    });
  }

  async findByName(
    name: string,
    institution_id?: string,
  ): Promise<DepartmentEntity | null> {
    return this.prisma.departments.findFirst({
      where: {
        name,
        deleted_at: null,
        ...(institution_id !== undefined && { institution_id }),
      },
      select: departmentSelect,
    });
  }

  async findByCode(
    code: string,
    institution_id?: string,
  ): Promise<DepartmentEntity | null> {
    return this.prisma.departments.findFirst({
      where: {
        code,
        deleted_at: null,
        ...(institution_id !== undefined && { institution_id }),
      },
      select: departmentSelect,
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters?: DepartmentSearchInput,
  ): Promise<{
    data: DepartmentEntity[];
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
      ...(filters?.institution_id !== undefined && {
        institution_id: filters.institution_id,
      }),
      ...(filters?.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    } satisfies Prisma.DepartmentsWhereInput;

    const [data, totalData] = await Promise.all([
      this.prisma.departments.findMany({
        where,
        skip,
        take: limit,
        select: departmentSelect,
        orderBy: {
          created_at: "desc",
        },
      }),
      this.prisma.departments.count({
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
    data: UpdateDepartmentInput,
    institution_id?: string,
  ): Promise<DepartmentEntity> {
    const where = {
      id,
      ...(institution_id !== undefined && { institution_id }),
    };

    const department = await this.prisma.departments.update({
      where,
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.code !== undefined && {
          code: data.code,
        }),
      },
      select: departmentSelect,
    });

    if (data.teacher_ids !== undefined) {
      // 1. Unassign teachers yang sebelumnya di departemen ini tapi tidak ada di teacher_ids baru
      await this.prisma.teachers.updateMany({
        where: {
          department_id: id,
          id: { notIn: data.teacher_ids },
          deleted_at: null,
        },
        data: {
          department_id: null,
        },
      });

      // 2. Assign teachers yang ada di teacher_ids baru
      if (data.teacher_ids.length > 0) {
        await this.prisma.teachers.updateMany({
          where: {
            id: { in: data.teacher_ids },
            deleted_at: null,
          },
          data: {
            department_id: id,
          },
        });
      }

      return (await this.findById(id, institution_id)) ?? department;
    }

    return department;
  }

  async delete(id: string, institution_id?: string): Promise<DepartmentEntity> {
    const where = {
      id,
      ...(institution_id !== undefined && { institution_id }),
    };

    // Unassign guru sebelum soft delete
    await this.prisma.teachers.updateMany({
      where: {
        department_id: id,
        deleted_at: null,
      },
      data: {
        department_id: null,
      },
    });

    return this.prisma.departments.update({
      where,
      data: {
        deleted_at: new Date(),
      },
      select: departmentSelect,
    });
  }
}
