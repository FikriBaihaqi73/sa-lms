import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStudentGradeApi, deleteStudentGradeApi, getStudentGradeStatsApi, getStudentGradesApi, updateStudentGradeApi } from "../api/studentGrades";
import type { StudentGradeFilters, StudentGradeInput } from "../types";
export const STUDENT_GRADES_QUERY_KEY = ["student-grades"] as const;
export function useStudentGrades(params: StudentGradeFilters) { return useQuery({ queryKey: [...STUDENT_GRADES_QUERY_KEY, params], queryFn: () => getStudentGradesApi(params), placeholderData: (previous) => previous }); }
export function useStudentGradeStats() { return useQuery({ queryKey: [...STUDENT_GRADES_QUERY_KEY, "stats"], queryFn: getStudentGradeStatsApi }); }
function invalidate(queryClient: ReturnType<typeof useQueryClient>) { void queryClient.invalidateQueries({ queryKey: STUDENT_GRADES_QUERY_KEY }); void queryClient.invalidateQueries({ queryKey: [...STUDENT_GRADES_QUERY_KEY, "stats"] }); }
export function useCreateStudentGrade() { const queryClient = useQueryClient(); return useMutation({ mutationFn: (input: StudentGradeInput) => createStudentGradeApi(input), onSuccess: () => invalidate(queryClient) }); }
export function useUpdateStudentGrade() { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<StudentGradeInput> }) => updateStudentGradeApi(id, input), onSuccess: () => invalidate(queryClient) }); }
export function useDeleteStudentGrade() { const queryClient = useQueryClient(); return useMutation({ mutationFn: (id: string) => deleteStudentGradeApi(id), onSuccess: () => invalidate(queryClient) }); }
