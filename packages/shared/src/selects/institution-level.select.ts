import type { Prisma } from "#generated/client";

export const institutionLevelSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updated_at: true,
  _count: {
    select: {
      institutions: {
        where: {
          deletedAt: null,
        },
      },
    },
  },
} satisfies Prisma.InstitutionLevelSelect;

export type InstitutionLevelSelectType = typeof institutionLevelSelect;

export type InstitutionLevelEntity = Prisma.InstitutionLevelGetPayload<{
  select: InstitutionLevelSelectType;
}>;

