import { createRoute } from "@tanstack/react-router";
import { ClassesPage } from "@/features/classes/components/ClassesPage";
import { settingsRoute } from "../../settingsLayout";

export const classesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/classes",
  component: ClassesPage,
});