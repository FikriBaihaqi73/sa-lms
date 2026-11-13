import { createRoute } from "@tanstack/react-router";
import { ModulesPage } from "@/features/modules";
import { settingsRoute } from "../../settingsLayout";

export const modulesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/modules",
  component: ModulesPage,
});
