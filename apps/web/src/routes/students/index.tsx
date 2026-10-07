import { createRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/features/students";
import { rootRoute } from "../__root";

export const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/students",
  component: StudentsPage,
});

