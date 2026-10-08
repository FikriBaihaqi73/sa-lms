import { createRoute } from '@tanstack/react-router';
import { TeachersPage } from '@/features/teachers';
import { settingsRoute } from '../../settingsLayout';

export const teachersRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/teachers',
  component: TeachersPage,
});
