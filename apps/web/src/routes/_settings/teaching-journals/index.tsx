import { createRoute } from "@tanstack/react-router";
import { TeachingJournalsPage } from "@/features/teaching-journals";
import { settingsRoute } from "../../settingsLayout";

export const teachingJournalsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/teaching-journals",
  component: TeachingJournalsPage,
});
