import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "../__root";

export const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/students",
  beforeLoad: () => {
    throw redirect({ to: "/referral-codes" });
  },
});

