import { createRoute } from "@tanstack/react-router";
import { SemestersPage } from "@/features/semesters";
import { settingsRoute } from "../../settingsLayout";

export const semestersRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: "/semesters",
	component: SemestersPage,
});

