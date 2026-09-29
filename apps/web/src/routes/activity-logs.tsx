import { createFileRoute } from '@tanstack/react-router'
import { ActivityLogList } from '@/features/activity-logs/components/ActivityLogList'

export const Route = createFileRoute('/activity-logs')({
  component: ActivityLogList,
})
