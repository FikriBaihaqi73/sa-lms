import { createRouter } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { rootRoute } from "./routes/__root";
import { rolesRoute } from "./routes/roles";
import { permissionsRoute } from "./routes/permissions";
import { rolePermissionsRoute } from "./routes/role-permissions";
import { institutionLevelsRoute } from "./routes/jenjang-institusi";
import { usersRoute } from "./routes/users";
import { nationalitiesRoute } from "./routes/nationalities";
import { loginRoute } from "./routes/login";
import { registerRoute } from "./routes/register";

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  rolesRoute,
  permissionsRoute,
  rolePermissionsRoute,
  institutionLevelsRoute,
  usersRoute,
  nationalitiesRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
