import { createRoute } from '@tanstack/react-router';
import { ReligionsPage } from '@/features/religions';
import { settingsRoute } from '../../settingsLayout';

export const religionsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/religions',
  component: ReligionsPage,
});
