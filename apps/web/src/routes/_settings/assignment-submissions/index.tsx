import { createRoute } from "@tanstack/react-router";
import { AssignmentSubmissionsLivePage } from "@/features/assignment-submissions";
import { rootRoute } from "../../__root";

export const assignmentSubmissionsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings/assignment-submissions",
	component: AssignmentSubmissionsLivePage,
});
