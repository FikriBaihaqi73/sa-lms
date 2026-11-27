import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "../__root";

export const studyPlansAliasRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/study-plans",
	beforeLoad: () => {
		throw redirect({ to: "/settings/study-plans" });
	},
});
