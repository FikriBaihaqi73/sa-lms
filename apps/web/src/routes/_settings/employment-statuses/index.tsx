import { createRoute } from '@tanstack/react-router';
import { EmploymentStatusesPage } from '@/features/employment-statuses';
import { settingsRoute } from '../../settingsLayout';

export const employmentStatusesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/employment-statuses',
  component: EmploymentStatusesPage,
});
