import { createRouter } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { rootRoute } from "./routes/__root";
import { rolesRoute } from "./routes/roles";
import { permissionsRoute } from "./routes/permissions";
<<<<<<< HEAD
import { rolePermissionsRoute } from "./routes/role-permissions";

const routeTree = rootRoute.addChildren([indexRoute, rolesRoute, permissionsRoute, rolePermissionsRoute]);
=======
import { institutionLevelsRoute } from "./routes/jenjang-institusi";
import { usersRoute } from "./routes/users";

const routeTree = rootRoute.addChildren([indexRoute, rolesRoute, permissionsRoute, institutionLevelsRoute, usersRoute]);
>>>>>>> 7aa00319f0efecf73e08e282e7fccd9b5fd0fa45

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

