import { createRoute } from '@tanstack/react-router';
import { NationalitiesPage } from '@/features/nationalities';
import { settingsRoute } from '../../settingsLayout';

export const nationalitiesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/nationalities',
  component: NationalitiesPage,
});
