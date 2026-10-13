import { createRoute } from "@tanstack/react-router";
import { StudentGuardiansPage } from "@/features/student-guardians";
import { rootRoute } from "../__root";

export const studentGuardiansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student-guardians",
  component: StudentGuardiansPage,
});
