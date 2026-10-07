import { createRoute } from '@tanstack/react-router';
import { SpecializationStatusesPage } from '@/features/specialization-statuses';
import { settingsRoute } from '../settingsLayout';

export const specializationStatusesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/specialization-statuses',
  component: SpecializationStatusesPage,
});
