import { createRoute } from "@tanstack/react-router";
import { ClassStudentsPage } from "@/features/class-student";
import { settingsRoute } from "../../settingsLayout";

export const classStudentsRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: "/class-students",
	component: ClassStudentsPage,
});
