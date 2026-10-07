import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudentApi,
  deleteStudentApi,
  getStudentByIdApi,
  getStudentDepartmentsApi,
  getStudentProfilesApi,
  getStudentsApi,
  updateStudentApi,
  type GetStudentsParams,
} from "../api/students";
import type { CreateStudentInput, UpdateStudentInput } from "../types";

export const STUDENTS_QUERY_KEY = ["students"] as const;
export const STUDENT_PROFILES_QUERY_KEY = ["student-form-profiles"] as const;
export const STUDENT_DEPARTMENTS_QUERY_KEY = ["student-form-departments"] as const;

export const useStudents = (params: GetStudentsParams) => useQuery({
  queryKey: [...STUDENTS_QUERY_KEY, params.page, params.limit, params.search ?? ""],
  queryFn: () => getStudentsApi(params),
  placeholderData: (previousData) => previousData,
});

export const useStudent = (id: string | undefined) => useQuery({
  queryKey: [...STUDENTS_QUERY_KEY, "detail", id],
  queryFn: () => getStudentByIdApi(id as string),
  enabled: Boolean(id),
});

export const useStudentProfiles = () => useQuery({
  queryKey: STUDENT_PROFILES_QUERY_KEY,
  queryFn: getStudentProfilesApi,
  staleTime: 5 * 60 * 1000,
});

export const useStudentDepartments = () => useQuery({
  queryKey: STUDENT_DEPARTMENTS_QUERY_KEY,
  queryFn: getStudentDepartmentsApi,
  staleTime: 5 * 60 * 1000,
});

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudentInput) => createStudentApi(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY }),
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStudentInput }) => updateStudentApi(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY }),
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudentApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY }),
  });
};

