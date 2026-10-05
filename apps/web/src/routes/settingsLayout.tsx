import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "settings",
  component: () => <Outlet />,
});
