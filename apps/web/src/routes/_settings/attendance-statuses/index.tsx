import { createRoute } from '@tanstack/react-router';
import { AttendanceStatusesPage } from '@/features/attendance-statuses';
import { settingsRoute } from '../../settingsLayout';

export const attendanceStatusesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/attendance-statuses',
  component: AttendanceStatusesPage,
});
