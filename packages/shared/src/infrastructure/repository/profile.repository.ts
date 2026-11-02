import type { PrismaClient } from "#generated/client";
import { type ProfileEntity, profileSelect } from "#selects/profile.select";

export interface CreateProfileInput {
  userId: string;
  roleId: string;
  institutionId: string;
  fullName: string;
  identityNumber?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: Date;
  religionId?: string;
  nationalityId?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
}

export interface UpdateProfileInput {
  institutionId?: string;
  fullName?: string;
  identityNumber?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: Date;
  religionId?: string;
  nationalityId?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
}

export interface FindAllProfileInput {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FindAllProfileResult {
  data: ProfileEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async studentOptions(institutionId: string, page: number, limit: number, search?: string) {
    const currentPage = Math.max(1, page);
    const pageSize = Math.min(100, Math.max(1, limit));
    const term = search?.trim();
    const where = {
      institutionId,
      deletedAt: null,
      student: { is: null },
      ...(term ? { OR: [
        { fullName: { contains: term, mode: "insensitive" as const } },
        { email: { contains: term, mode: "insensitive" as const } },
      ] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.profile.findMany({ where, select: { id: true, fullName: true, email: true }, orderBy: [{ fullName: "asc" }, { id: "asc" }], skip: (currentPage - 1) * pageSize, take: pageSize }),
      this.prisma.profile.count({ where }),
    ]);
    return { data, meta: { page: currentPage, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async create(data: CreateProfileInput): Promise<ProfileEntity> {
    return this.prisma.profile.create({
      data: {
        userId: data.userId,
        roleId: data.roleId,
        institutionId: data.institutionId,
        fullName: data.fullName,
        ...(data.identityNumber !== undefined && {
          identityNumber: data.identityNumber,
        }),
        ...(data.gender !== undefined && {
          gender: data.gender,
        }),
        ...(data.birthPlace !== undefined && {
          birthPlace: data.birthPlace,
        }),
        ...(data.birthDate !== undefined && {
          birthDate: data.birthDate,
        }),
        ...(data.religionId !== undefined && {
          religionId: data.religionId,
        }),
        ...(data.nationalityId !== undefined && {
          nationalityId: data.nationalityId,
        }),
        ...(data.address !== undefined && {
          address: data.address,
        }),
        ...(data.phoneNumber !== undefined && {
          phoneNumber: data.phoneNumber,
        }),
        ...(data.email !== undefined && {
          email: data.email,
        }),
        ...(data.photoUrl !== undefined && {
          photoUrl: data.photoUrl,
        }),
      },
      select: profileSelect,
    });
  }

  async findById(id: string): Promise<ProfileEntity | null> {
    return this.prisma.profile.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: profileSelect,
    });
  }

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    return this.prisma.profile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      select: profileSelect,
    });
  }

  async findAll(
    params: FindAllProfileInput = {},
  ): Promise<FindAllProfileResult> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const search = params.search?.trim();

    const where = {
      deletedAt: null,
      ...(search
        ? {
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
                email: {
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
                users: {
                  email: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
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
              {
                religion: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                nationality: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        select: profileSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.profile.count({ where }),
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

  async update(id: string, data: UpdateProfileInput): Promise<ProfileEntity> {
    return this.prisma.profile.update({
      where: {
        id,
      },
      data: {
        ...(data.institutionId !== undefined && {
          institutionId: data.institutionId,
        }),
        ...(data.fullName !== undefined && {
          fullName: data.fullName,
        }),
        ...(data.identityNumber !== undefined && {
          identityNumber: data.identityNumber,
        }),
        ...(data.gender !== undefined && {
          gender: data.gender,
        }),
        ...(data.birthPlace !== undefined && {
          birthPlace: data.birthPlace,
        }),
        ...(data.birthDate !== undefined && {
          birthDate: data.birthDate,
        }),
        ...(data.religionId !== undefined && {
          religionId: data.religionId,
        }),
        ...(data.nationalityId !== undefined && {
          nationalityId: data.nationalityId,
        }),
        ...(data.address !== undefined && {
          address: data.address,
        }),
        ...(data.phoneNumber !== undefined && {
          phoneNumber: data.phoneNumber,
        }),
        ...(data.email !== undefined && {
          email: data.email,
        }),
        ...(data.photoUrl !== undefined && {
          photoUrl: data.photoUrl,
        }),
      },
      select: profileSelect,
    });
  }

  async delete(id: string): Promise<ProfileEntity> {
    return this.prisma.profile.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: profileSelect,
    });
  }
}
