import type { Prisma, PrismaClient } from "#generated/client";
import {
  type UserEntity,
  type UserWithPasswordEntity,
  userSelect,
  userWithPasswordSelect,
} from "#selects/user.select";

export interface CreateUserInput {
  email: string;
  password: string;
  is_active?: boolean | undefined;
}

export interface UpdateUserInput {
  email?: string | undefined;
  password?: string | undefined;
  is_active?: boolean | undefined;
}

export interface FindAllUserInput {
  page?: number;
  limit?: number;
  search?: string;
  /**
   * When provided, only users that belong to this institution (through a
   * non-deleted profile) are returned. The filter is part of the shared
   * `where` clause so it also constrains pagination and the `total` count.
   * Omit it to read users across every institution (superadmin scope).
   */
  institution_id?: string;
}

export interface FindAllUserResult {
  data: UserEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateUserInput): Promise<UserEntity> {
    return this.prisma.users.create({
      data: {
        email: data.email,
        password: data.password,
        ...(data.is_active !== undefined && {
          is_active: data.is_active,
        }),
      },
      select: userSelect,
    });
  }

  /**
   * Look up a user by ID. When `institutionId` is supplied the lookup is
   * scoped to that institution so a user owned by another institution is
   * reported as missing (null) instead of being leaked.
   */
  async findById(id: string, institutionId?: string): Promise<UserEntity | null> {
    return this.prisma.users.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(institutionId !== undefined
          ? { profile: { some: { institutionId, deletedAt: null } } }
          : {}),
      },
      select: userSelect,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.users.findFirst({
      where: {
        email,
        deleted_at: null,
      },
      select: userSelect,
    });
  }

  async findAll(params: FindAllUserInput = {}): Promise<FindAllUserResult> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const search = params.search?.trim();
    const institutionId = params.institution_id?.trim();

    const where: Prisma.UsersWhereInput = {
      deleted_at: null,
      // Institution scope is applied up-front so pagination, search and the
      // `total` count below only ever consider the caller's institution.
      ...(institutionId
        ? { profile: { some: { institutionId, deletedAt: null } } }
        : {}),
      ...(search
        ? {
            OR: [
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                profile: {
                  some: {
                    OR: [
                      {
                        fullName: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        identityNumber: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        phoneNumber: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        institution: {
                          name: {
                            contains: search,
                            mode: "insensitive" as const,
                          },
                        },
                      },
                      {
                        role: {
                          name: {
                            contains: search,
                            mode: "insensitive" as const,
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        select: userSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateUserInput): Promise<UserEntity> {
    return this.prisma.users.update({
      where: {
        id,
      },
      data: {
        ...(data.email !== undefined && {
          email: data.email,
        }),
        ...(data.password !== undefined && {
          password: data.password,
        }),
        ...(data.is_active !== undefined && {
          is_active: data.is_active,
        }),
      },
      select: userSelect,
    });
  }

  async delete(id: string): Promise<UserEntity> {
    return this.prisma.users.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
      select: userSelect,
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPasswordEntity | null> {
    return this.prisma.users.findFirst({
      where: {
        email,
        deleted_at: null,
      },
      select: userWithPasswordSelect,
    });
  }
}
