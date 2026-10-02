import { createRoute } from "@tanstack/react-router";
import { SuperadminSettingsPage } from "@/features/superadmin/components/SuperadminSettingsPage";
import { rootRoute } from "../__root";

export const superadminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/superadmin/settings",
  component: SuperadminSettingsPage,
});
