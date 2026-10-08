import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTeacherApi,
  deleteTeacherApi,
  getEmploymentStatusesApi,
  getSpecializationsApi,
  getTeacherByIdApi,
  getTeacherClassSubjectsApi,
  getTeacherProfilesApi,
  getTeachersApi,
  getTeacherStatsApi,
  updateTeacherApi,
  type GetTeachersParams,
} from "../api/teachers";
import type { CreateTeacherInput, UpdateTeacherInput } from "../types";

export const TEACHERS_QUERY_KEY = ["teachers"] as const;
export const TEACHER_STATS_QUERY_KEY = ["teacher-stats"] as const;
export const TEACHER_PROFILES_QUERY_KEY = ["teacher-form-profiles"] as const;
export const EMPLOYMENT_STATUSES_QUERY_KEY = ["employment-statuses"] as const;
export const SPECIALIZATIONS_QUERY_KEY = ["specializations"] as const;

export const useTeachers = (params: GetTeachersParams) =>
  useQuery({
    queryKey: [
      ...TEACHERS_QUERY_KEY,
      params.page,
      params.limit,
      params.search ?? "",
      params.status ?? "",
      params.specialization ?? "",
    ],
    queryFn: () => getTeachersApi(params),
    placeholderData: (previousData) => previousData,
  });

export const useTeacherStats = () =>
  useQuery({
    queryKey: TEACHER_STATS_QUERY_KEY,
    queryFn: getTeacherStatsApi,
  });

export const useTeacher = (id: string | undefined) =>
  useQuery({
    queryKey: [...TEACHERS_QUERY_KEY, "detail", id],
    queryFn: () => getTeacherByIdApi(id as string),
    enabled: Boolean(id),
  });

export const useTeacherClassSubjects = (teacherId: string | undefined) =>
  useQuery({
    queryKey: [...TEACHERS_QUERY_KEY, "class-subjects", teacherId],
    queryFn: () => getTeacherClassSubjectsApi(teacherId as string),
    enabled: Boolean(teacherId),
  });

export const useTeacherProfiles = () =>
  useQuery({
    queryKey: TEACHER_PROFILES_QUERY_KEY,
    queryFn: getTeacherProfilesApi,
    staleTime: 5 * 60 * 1000,
  });

export const useEmploymentStatuses = () =>
  useQuery({
    queryKey: EMPLOYMENT_STATUSES_QUERY_KEY,
    queryFn: getEmploymentStatusesApi,
    staleTime: 5 * 60 * 1000,
  });

export const useSpecializations = () =>
  useQuery({
    queryKey: SPECIALIZATIONS_QUERY_KEY,
    queryFn: getSpecializationsApi,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeacherInput) => createTeacherApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEACHER_STATS_QUERY_KEY });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTeacherInput }) =>
      updateTeacherApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEACHER_STATS_QUERY_KEY });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeacherApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEACHER_STATS_QUERY_KEY });
    },
  });
};
