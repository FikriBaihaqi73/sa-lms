import { createRoute } from "@tanstack/react-router";
import { ExaminationScoresPage } from "@/features/examination-scores/components/ExaminationScoresPage";
import { settingsRoute } from "../../settingsLayout";

export const examinationScoresRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: "/examination-scores",
	component: ExaminationScoresPage,
});
