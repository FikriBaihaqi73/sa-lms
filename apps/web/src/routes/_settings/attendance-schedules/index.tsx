import { createRoute } from "@tanstack/react-router";
import { AttendanceSchedulesPage } from "@/features/attendance-schedules";
import { settingsRoute } from "../../settingsLayout";

export const attendanceSchedulesRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: "/attendance-schedules",
	component: AttendanceSchedulesPage,
});
