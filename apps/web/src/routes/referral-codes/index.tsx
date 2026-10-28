import { createRoute } from "@tanstack/react-router";
import { ReferralCodesPage } from "@/features/referral-codes";
import { rootRoute } from "../__root";

export const referralCodesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/referral-codes",
  component: ReferralCodesPage,
});
