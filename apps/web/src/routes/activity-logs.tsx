import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { ActivityLogList } from '../features/activity-logs/components/ActivityLogList';

export const activityLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity-logs',
  component: ActivityLogList,
});
