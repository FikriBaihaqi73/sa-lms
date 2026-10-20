import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGradeApi,
  deleteGradeApi,
  getGradesApi,
  updateGradeApi,
} from "../api/grades";
import type { CreateGradeInput, UpdateGradeInput } from "../types";

export const GRADES_QUERY_KEY = ["grades"] as const;

/**
 * Hook query untuk mengambil seluruh daftar standar penilaian.
 */
export const useGrades = () => {
  return useQuery({
    queryKey: GRADES_QUERY_KEY,
    queryFn: () => getGradesApi(),
  });
};

/**
 * Hook mutation untuk membuat standar penilaian baru.
 */
export const useCreateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGradeInput) => createGradeApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADES_QUERY_KEY });
    },
  });
};

/**
 * Hook mutation untuk memperbarui standar penilaian.
 */
export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGradeInput }) =>
      updateGradeApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADES_QUERY_KEY });
    },
  });
};

/**
 * Hook mutation untuk menghapus standar penilaian.
 */
export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGradeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADES_QUERY_KEY });
    },
  });
};
