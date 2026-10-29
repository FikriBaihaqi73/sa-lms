import { createRoute } from "@tanstack/react-router";
import { SubjectsPage } from "@/features/subjects";
import { settingsRoute } from "../../settingsLayout";

export const subjectsRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: "/subjects",
	component: SubjectsPage,
});
