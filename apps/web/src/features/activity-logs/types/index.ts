import type { ActivityLogEntity } from '@repo/shared/entities/activity-log.entity';

export type ActivityLog = ActivityLogEntity;

export interface ActivityLogListResponse {
  data: ActivityLog[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}
