import { createRoute } from "@tanstack/react-router";
import { AssignmentsPage } from "@/features/assignments";
import { rootRoute } from "../../__root";

export const assignmentsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings/assignments",
	component: AssignmentsPage,
});
