import { useQuery } from '@tanstack/react-query';
import { getActivityLogs } from '../api/get-activity-logs';

export const useActivityLogs = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ['activity-logs', page, limit, search],
    queryFn: () => getActivityLogs(page, limit, search),
  });
};
