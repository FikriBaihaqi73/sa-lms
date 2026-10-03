import { createRoute } from '@tanstack/react-router';
import { AcademicStatusesPage } from '@/features/academic-statuses';
import { rootRoute } from '../__root';

export const academicStatusesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/academic-statuses',
  component: AcademicStatusesPage,
});
