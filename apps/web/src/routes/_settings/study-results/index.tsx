import { createRoute } from "@tanstack/react-router";
import { StudyResultsPage } from "@/features/study-results";
import { settingsRoute } from "../../settingsLayout";

export const studyResultsRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: "/study-results",
	component: StudyResultsPage,
});
