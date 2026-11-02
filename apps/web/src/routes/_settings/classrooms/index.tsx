import { createRoute } from "@tanstack/react-router";
import { ClassroomPage } from "../../../features/classroom/components/ClassroomPage";
import { rootRoute } from "../../__root";

export const classroomsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings/classrooms",
	component: ClassroomPage,
});
