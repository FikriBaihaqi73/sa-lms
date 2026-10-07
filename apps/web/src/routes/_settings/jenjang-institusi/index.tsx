import { createRoute } from "@tanstack/react-router";
import { InstitutionLevelsPage } from "@/features/institution-levels/components/InstitutionLevelsPage";
import { settingsRoute } from '../../settingsLayout';

export const institutionLevelsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/jenjang-institusi",
  component: InstitutionLevelsPage,
});
