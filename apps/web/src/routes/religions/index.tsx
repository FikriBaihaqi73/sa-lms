import { createRoute } from '@tanstack/react-router';
import { ReligionsPage } from '@/features/religions';
import { rootRoute } from '../__root';

export const religionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/religions',
  component: ReligionsPage,
});
