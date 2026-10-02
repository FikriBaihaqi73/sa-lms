import { createRouter } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { rootRoute } from "./routes/__root";
import { rolesRoute } from "./routes/roles";
import { activityLogsRoute } from "./routes/activity-logs";
import { permissionsRoute } from "./routes/permissions";
import { rolePermissionsRoute } from "./routes/role-permissions";
import { institutionLevelsRoute } from "./routes/jenjang-institusi";
import { usersRoute } from "./routes/users";
import { nationalitiesRoute } from "./routes/nationalities";
import { religionsRoute } from "./routes/religions";
import { gradesRoute } from "./routes/grades";
import { loginRoute } from "./routes/login";
import { registerRoute } from "./routes/register";
import { superadminSettingsRoute } from "./routes/superadmin-settings";

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  rolesRoute,
  permissionsRoute,
  activityLogsRoute,
  gradesRoute,
  rolePermissionsRoute,
  institutionLevelsRoute,
  usersRoute,
  nationalitiesRoute,
  religionsRoute,
  superadminSettingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
