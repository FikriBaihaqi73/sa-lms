import { createRoute } from "@tanstack/react-router";
import { InstitutionsPage } from "@/features/institutions/components/InstitutionsPage";
import { rootRoute } from "../__root";

export const institutionsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/institutions",
	component: InstitutionsPage,
});
