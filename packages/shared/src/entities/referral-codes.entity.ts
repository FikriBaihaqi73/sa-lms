import type { Prisma } from "#generated/client";
import type { referralCodeSelect } from "../selects/referral-codes.select";

export type ReferralCodeEntity = Prisma.ReferralCodesGetPayload<{
  select: typeof referralCodeSelect;
}>;

export type ReferralCodeListEntity = ReferralCodeEntity[];
