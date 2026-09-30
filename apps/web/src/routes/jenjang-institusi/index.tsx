import { createRoute } from "@tanstack/react-router";
import { InstitutionLevelsPage } from "@/features/institution-levels/components/InstitutionLevelsPage";
import { rootRoute } from "../__root";

export const institutionLevelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jenjang-institusi",
  component: InstitutionLevelsPage,
});
