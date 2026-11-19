import { AnnouncementsPage } from "@/features/announcements";
import { createRoute } from "@tanstack/react-router";
import { settingsRoute } from "../../settingsLayout";

export const announcementsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/announcements",
  component: AnnouncementsPage,
});
