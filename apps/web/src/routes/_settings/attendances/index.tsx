import { createRoute } from "@tanstack/react-router";
import { AttendancesPage } from "@/features/attendances/components/AttendancesPage";
import { settingsRoute } from "../../settingsLayout";

export const attendancesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/attendances",
  component: AttendancesPage,
});

