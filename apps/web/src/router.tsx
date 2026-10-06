import { createRouter } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { rootRoute } from "./routes/__root";
import { academicStatusesRoute } from "./routes/academic-statuses";
import { activityLogsRoute } from "./routes/activity-logs";
import { employmentStatusesRoute } from "./routes/employment-statuses";
import { gradesRoute } from "./routes/grades";
import { institutionsRoute } from "./routes/institutions";
import { institutionLevelsRoute } from "./routes/jenjang-institusi";
import { loginRoute } from "./routes/login";
import { nationalitiesRoute } from "./routes/nationalities";
import { permissionsRoute } from "./routes/permissions";
import { registerRoute } from "./routes/register";
import { religionsRoute } from "./routes/religions";
import { rolePermissionsRoute } from "./routes/role-permissions";
import { rolesRoute } from "./routes/roles";
import { superadminSettingsRoute } from "./routes/superadmin-settings";
import { usersRoute } from "./routes/users";

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	rolesRoute,
	permissionsRoute,
	activityLogsRoute,
	gradesRoute,
	institutionsRoute,
	rolePermissionsRoute,
	institutionLevelsRoute,
	usersRoute,
	nationalitiesRoute,
	academicStatusesRoute,
	employmentStatusesRoute,
	religionsRoute,
	superadminSettingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
