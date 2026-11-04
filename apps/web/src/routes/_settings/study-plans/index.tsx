import { createRoute } from "@tanstack/react-router";
import { StudyPlansPage } from "@/features/study-plans/components/StudyPlansPage";
import { rootRoute } from "../../__root";

export const studyPlansRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings/study-plans",
	component: StudyPlansPage,
});

