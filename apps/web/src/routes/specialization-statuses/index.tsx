import { createRoute } from '@tanstack/react-router';
import { SpecializationStatusesPage } from '@/features/specialization-statuses';
import { settingsRoute } from '../settingsLayout';

export const specializationStatusesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/specialization-statuses',
  component: SpecializationStatusesPage,
});

export const specializationsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/specializations',
  component: SpecializationStatusesPage,
});
