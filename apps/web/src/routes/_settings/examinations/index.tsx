import { createRoute } from "@tanstack/react-router";
import { ExaminationsPage } from "@/features/examinations/components/ExaminationsPage";
import { settingsRoute } from "../../settingsLayout";

export const examinationsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/examinations",
  component: ExaminationsPage,
});
