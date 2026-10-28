import type { Prisma } from "#generated/client";

export const referralCodeSelect = {
  id: true,
  code: true,
  institution_id: true,
  usage_quota: true,
  used_count: true,
  enrollment_year: true,
  department_id: true,
  expires_at: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  institution: {
    select: {
      id: true,
      name: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} satisfies Prisma.ReferralCodesSelect;

export type ReferralCodeSelectType = typeof referralCodeSelect;
