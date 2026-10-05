import { createRoute } from '@tanstack/react-router';
import { UsersPage } from '@/features/users';
import { settingsRoute } from '../../settingsLayout';

export const usersRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/users',
  component: UsersPage,
});
