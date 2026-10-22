import { createRoute } from "@tanstack/react-router";
import { DepartmentsPage } from "@/features/departments";
import { settingsRoute } from "../../settingsLayout";

export const departmentsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/departments",
  component: DepartmentsPage,
});
