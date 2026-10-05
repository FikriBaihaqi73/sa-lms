import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "user",
  component: () => <Outlet />,
});
