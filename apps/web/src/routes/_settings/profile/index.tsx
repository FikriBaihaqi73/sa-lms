import { createRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/features/profile';
import { settingsRoute } from '../../settingsLayout';

export const profileRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/profile',
  component: ProfilePage,
});
