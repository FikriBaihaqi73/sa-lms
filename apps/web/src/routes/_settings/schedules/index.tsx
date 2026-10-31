import { createRoute } from "@tanstack/react-router";
import { SchedulesPage } from "@/features/schedules/components/SchedulesPage";
import { settingsRoute } from "../../settingsLayout";

export const schedulesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/schedules",
  component: SchedulesPage,
});
