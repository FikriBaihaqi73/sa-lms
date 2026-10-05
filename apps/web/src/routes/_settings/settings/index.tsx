import { createRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { settingsRoute } from '../../settingsLayout';

export const settingsRouteDef = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/settings",
  component: SettingsPage,
});
