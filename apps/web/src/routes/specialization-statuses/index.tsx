import { createRoute } from '@tanstack/react-router';
import { SpecializationStatusesPage } from '@/features/specialization-statuses';
import { rootRoute } from '../__root';

export const specializationStatusesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/specialization-statuses',
  component: SpecializationStatusesPage,
});
