import { createRoute } from "@tanstack/react-router";
import { GradesPage } from "@/features/grades";
import { rootRoute } from "../__root";

export const gradesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/grades",
  component: GradesPage,
});
