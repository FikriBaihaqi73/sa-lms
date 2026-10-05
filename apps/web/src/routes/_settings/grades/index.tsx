import { createRoute } from "@tanstack/react-router";
import { GradesPage } from "@/features/grades";
import { settingsRoute } from '../../settingsLayout';

export const gradesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/grades",
  component: GradesPage,
});
