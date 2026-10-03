import { createRoute } from '@tanstack/react-router';
import { EmploymentStatusesPage } from '@/features/employment-statuses';
import { rootRoute } from '../__root';

export const employmentStatusesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employment-statuses',
  component: EmploymentStatusesPage,
});
