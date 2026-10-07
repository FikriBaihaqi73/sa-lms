import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { settingsRoute } from "./routes/settingsLayout";
import { userRoute } from "./routes/userLayout";

import { indexRoute } from "./routes/_user/index";
import { settingsRouteDef } from "./routes/_settings/settings/index";
import { specializationStatusesRoute } from "./routes/specialization-statuses/index";
import { academicStatusesRoute } from "./routes/_settings/academic-statuses/index";
import { activityLogsRoute } from "./routes/_settings/activity-logs";
import { employmentStatusesRoute } from "./routes/_settings/employment-statuses/index";
import { gradesRoute } from "./routes/_settings/grades/index";
import { institutionsRoute } from "./routes/institutions/index";
import { institutionLevelsRoute } from "./routes/_settings/jenjang-institusi/index";
import { loginRoute } from "./routes/login/index";
import { nationalitiesRoute } from "./routes/_settings/nationalities/index";
import { permissionsRoute } from "./routes/_settings/permissions/index";
import { registerRoute } from "./routes/register/index";
import { religionsRoute } from "./routes/_settings/religions/index";
import { rolePermissionsRoute } from "./routes/_settings/role-permissions/index";
import { rolesRoute } from "./routes/_settings/roles/index";
import { usersRoute } from "./routes/_settings/users/index";

const settingsTree = settingsRoute.addChildren([
	rolesRoute,
	permissionsRoute,
	activityLogsRoute,
	gradesRoute,
	rolePermissionsRoute,
	institutionLevelsRoute,
	usersRoute,
	nationalitiesRoute,
	academicStatusesRoute,
	employmentStatusesRoute,
	religionsRoute,
	settingsRouteDef,
	specializationStatusesRoute,
]);

const userTree = userRoute.addChildren([indexRoute]);

const routeTree = rootRoute.addChildren([
	settingsTree,
	userTree,
	institutionsRoute,
	loginRoute,
	registerRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
