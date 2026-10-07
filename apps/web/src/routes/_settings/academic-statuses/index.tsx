import { createRoute } from '@tanstack/react-router';
import { AcademicStatusesPage } from '@/features/academic-statuses';
import { settingsRoute } from '../../settingsLayout';

export const academicStatusesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/academic-statuses',
  component: AcademicStatusesPage,
});
