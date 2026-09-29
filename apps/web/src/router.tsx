import { createRouter } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { rootRoute } from "./routes/__root";
import { rolesRoute } from "./routes/roles";

const routeTree = rootRoute.addChildren([indexRoute, rolesRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
