import { createRoute, redirect } from "@tanstack/react-router";
import { userRoute } from '../userLayout';

export const indexRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/",
  beforeLoad: () => { throw redirect({ to: "/nationalities" }); },
});
