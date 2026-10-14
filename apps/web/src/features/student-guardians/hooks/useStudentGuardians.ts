import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudentGuardianApi,
  deleteStudentGuardianApi,
  getGuardianOptionsApi,
  getStudentGuardianByIdApi,
  getStudentGuardiansApi,
  getStudentOptionsApi,
  type GetStudentGuardiansParams,
  updateStudentGuardianApi,
} from "../api/studentGuardians";
import type { StudentGuardianInput } from "../types";

export const STUDENT_GUARDIANS_QUERY_KEY = ["student-guardians"] as const;
export const STUDENT_GUARDIAN_STUDENTS_QUERY_KEY = [
  ...STUDENT_GUARDIANS_QUERY_KEY,
  "students",
] as const;
export const STUDENT_GUARDIAN_GUARDIANS_QUERY_KEY = [
  ...STUDENT_GUARDIANS_QUERY_KEY,
  "guardians",
] as const;

/** Page size used by the searchable Student/Guardian selectors in the form. */
export const OPTION_PAGE_SIZE = 20;

export function useStudentGuardians(params: GetStudentGuardiansParams) {
  return useQuery({
    queryKey: [
      ...STUDENT_GUARDIANS_QUERY_KEY,
      params.page,
      params.limit,
      params.search ?? "",
    ],
    queryFn: () => getStudentGuardiansApi(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useStudentGuardian(id: string | null) {
  return useQuery({
    queryKey: [...STUDENT_GUARDIANS_QUERY_KEY, "detail", id],
    queryFn: () => getStudentGuardianByIdApi(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Server-side searchable, paginated student options for the relation form.
 * Pages accumulate so students beyond the first page stay selectable.
 */
export function useStudentOptions(search: string) {
  return useInfiniteQuery({
    queryKey: [...STUDENT_GUARDIAN_STUDENTS_QUERY_KEY, search],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getStudentOptionsApi({ page: pageParam, limit: OPTION_PAGE_SIZE, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.totalPages > lastPage.meta.page
        ? lastPage.meta.page + 1
        : undefined,
    enabled: true,
  });
}

/**
 * Server-side searchable, paginated guardian options for the relation form.
 * Pages accumulate so guardians beyond the first page stay selectable.
 */
export function useGuardianOptions(search: string) {
  return useInfiniteQuery({
    queryKey: [...STUDENT_GUARDIAN_GUARDIANS_QUERY_KEY, search],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getGuardianOptionsApi({ page: pageParam, limit: OPTION_PAGE_SIZE, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.totalPages > lastPage.meta.page
        ? lastPage.meta.page + 1
        : undefined,
    enabled: true,
  });
}

export function useCreateStudentGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentGuardianInput) => createStudentGuardianApi(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STUDENT_GUARDIANS_QUERY_KEY }),
  });
}

export function useUpdateStudentGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StudentGuardianInput }) =>
      updateStudentGuardianApi(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STUDENT_GUARDIANS_QUERY_KEY }),
  });
}

export function useDeleteStudentGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudentGuardianApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STUDENT_GUARDIANS_QUERY_KEY }),
  });
}
