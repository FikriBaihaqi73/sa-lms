import { createRouter } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { rootRoute } from "./routes/__root";
import { rolesRoute } from "./routes/roles";
import { activityLogsRoute } from "./routes/activity-logs";

const routeTree = rootRoute.addChildren([indexRoute, rolesRoute, activityLogsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
