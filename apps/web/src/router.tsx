import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { settingsRoute } from "./routes/settingsLayout";
import { userRoute } from "./routes/userLayout";

import { indexRoute } from "./routes/_user/index";

import { rolesRoute } from "./routes/_settings/roles";
import { activityLogsRoute } from "./routes/_settings/activity-logs";
import { permissionsRoute } from "./routes/_settings/permissions";
import { rolePermissionsRoute } from "./routes/_settings/role-permissions";
import { institutionLevelsRoute } from "./routes/_settings/jenjang-institusi";
import { usersRoute } from "./routes/_settings/users";
import { nationalitiesRoute } from "./routes/_settings/nationalities";
import { academicStatusesRoute } from "./routes/_settings/academic-statuses";
import { religionsRoute } from "./routes/_settings/religions";
import { gradesRoute } from "./routes/_settings/grades";
import { employmentStatusesRoute } from "./routes/_settings/employment-statuses";
import { settingsRouteDef } from "./routes/_settings/settings";

import { loginRoute } from "./routes/login";
import { registerRoute } from "./routes/register";
import { specializationStatusesRoute } from "./routes/specialization-statuses";
import { attendanceStatusesRoute } from "./routes/_settings/attendance-statuses";

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
  attendanceStatusesRoute,
]);

const userTree = userRoute.addChildren([
  indexRoute,
]);

const routeTree = rootRoute.addChildren([
  settingsTree,
  userTree,
  loginRoute,
  registerRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
