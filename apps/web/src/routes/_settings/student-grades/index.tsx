import { createRoute } from "@tanstack/react-router";
import { StudentGradesPage } from "@/features/student-grades";
import { settingsRoute } from "../../settingsLayout";

export const studentGradesRoute = createRoute({ getParentRoute: () => settingsRoute, path: "/student-grades", component: StudentGradesPage });
