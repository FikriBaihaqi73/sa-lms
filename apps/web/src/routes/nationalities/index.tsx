import { createRoute } from '@tanstack/react-router';
import { NationalitiesPage } from '@/features/nationalities';
import { rootRoute } from '../__root';

export const nationalitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nationalities',
  component: NationalitiesPage,
});
