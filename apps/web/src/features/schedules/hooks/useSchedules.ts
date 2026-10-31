import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createScheduleApi,
  deleteScheduleApi,
  getScheduleByIdApi,
  getScheduleOptionsApi,
  getSchedulesApi,
  updateScheduleApi,
} from "../api/schedules";
import type {
  CreateScheduleInput,
  GetSchedulesParams,
  UpdateScheduleInput,
} from "../types";

export const SCHEDULES_QUERY_KEY = ["schedules"] as const;
export const SCHEDULE_OPTIONS_QUERY_KEY = ["schedule-options"] as const;

export const useSchedules = (params: GetSchedulesParams = {}) =>
  useQuery({
    queryKey: [
      ...SCHEDULES_QUERY_KEY,
      params.page ?? 1,
      params.limit ?? 10,
      params.search ?? "",
      params.day ?? "",
      params.classroomId ?? "",
      params.classSubjectId ?? "",
    ],
    queryFn: () => getSchedulesApi(params),
    placeholderData: (previousData) => previousData,
  });

export const useSchedule = (id: string | undefined) =>
  useQuery({
    queryKey: [...SCHEDULES_QUERY_KEY, "detail", id],
    queryFn: () => getScheduleByIdApi(id as string),
    enabled: Boolean(id),
  });

export const useScheduleOptions = () =>
  useQuery({
    queryKey: SCHEDULE_OPTIONS_QUERY_KEY,
    queryFn: getScheduleOptionsApi,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScheduleInput) => createScheduleApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateScheduleInput }) =>
      updateScheduleApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScheduleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
    },
  });
};
