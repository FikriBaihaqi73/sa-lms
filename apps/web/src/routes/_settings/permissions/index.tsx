import { createRoute } from "@tanstack/react-router";
import { PermissionPage } from "@/features/permissions";
import { settingsRoute } from '../../settingsLayout';

export const permissionsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/permissions",
  component: PermissionPage,
});
