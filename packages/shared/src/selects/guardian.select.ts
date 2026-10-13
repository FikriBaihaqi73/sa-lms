import type { Prisma } from "#generated/client";

export const guardianSelect = {
  id: true,
  institutionId: true,
  fullName: true,
  relationship: true,
  phoneNumber: true,
  email: true,
  address: true,
  occupation: true,
  createdAt: true,
  updatedAt: true,
  studentGuardians: true,
} satisfies Prisma.GuardianSelect;

export type GuardianSelectType = typeof guardianSelect;

export type GuardianEntity = Prisma.GuardianGetPayload<{
  select: GuardianSelectType;
}>;
