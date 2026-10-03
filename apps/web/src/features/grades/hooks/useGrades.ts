import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGradesApi, updateGradeApi } from "../api/grades";
import type { UpdateGradeInput } from "../types";

export const GRADES_QUERY_KEY = ["grades"] as const;

export const useGrades = (search?: string) => {
  return useQuery({
    queryKey: [...GRADES_QUERY_KEY, "list", search ?? ""],
    queryFn: () => getGradesApi(search),
  });
};

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
