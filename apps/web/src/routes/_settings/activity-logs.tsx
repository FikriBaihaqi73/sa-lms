import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from '../settingsLayout';
import { ActivityLogList } from '../../features/activity-logs/components/ActivityLogList';

export const activityLogsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/activity-logs',
  component: ActivityLogList,
});
