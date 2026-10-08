import { createRoute } from "@tanstack/react-router";
import { GuardiansPage } from "@/features/guardians";
import { rootRoute } from "../__root";

export const guardiansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guardians",
  component: GuardiansPage,
});
