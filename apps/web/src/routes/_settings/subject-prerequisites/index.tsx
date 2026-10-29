import { createRoute } from "@tanstack/react-router";
import { SubjectPrerequisitesPage } from "@/features/subject-prerequisites/components/SubjectPrerequisitesPage";
import { settingsRoute } from "../../settingsLayout";

export const subjectPrerequisitesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/subject-prerequisites",
  component: SubjectPrerequisitesPage,
});

