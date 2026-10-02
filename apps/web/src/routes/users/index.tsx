import { createRoute } from '@tanstack/react-router';
import { UsersPage } from '@/features/users';
import { rootRoute } from '../__root';

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});
