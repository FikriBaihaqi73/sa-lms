import { createRoute } from "@tanstack/react-router";
import { AssignmentTypesPage } from "@/features/assignment-types";
import { settingsRoute } from "../../settingsLayout";

export const assignmentTypesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/assignment-types",
  component: AssignmentTypesPage,
});
