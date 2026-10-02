import { createRoute } from "@tanstack/react-router";
import { PermissionPage } from "@/features/permissions";
import { rootRoute } from "../__root";

export const permissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/permissions",
  component: PermissionPage,
});
