import { createRoute } from "@tanstack/react-router";
import { ClassSubjectPage } from "@/features/class-subject/components/ClassSubjectPage";
import { settingsRoute } from "../../settingsLayout";

export const classSubjectsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/class-subjects",
  component: ClassSubjectPage,
});
