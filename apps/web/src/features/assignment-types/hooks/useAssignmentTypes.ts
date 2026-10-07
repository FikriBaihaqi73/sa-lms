import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAssignmentTypeApi,
  deleteAssignmentTypeApi,
  getAssignmentTypeByIdApi,
  getAssignmentTypesApi,
  updateAssignmentTypeApi,
} from "../api/assignment-types";
import type {
  CreateAssignmentTypeInput,
  UpdateAssignmentTypeInput,
} from "../types";

export const ASSIGNMENT_TYPES_QUERY_KEY = ["assignment-types"] as const;

export const useAssignmentTypes = () => {
  return useQuery({
    queryKey: ASSIGNMENT_TYPES_QUERY_KEY,
    queryFn: getAssignmentTypesApi,
  });
};

export const useAssignmentType = (id?: string) => {
  return useQuery({
    queryKey: [...ASSIGNMENT_TYPES_QUERY_KEY, "detail", id],
    queryFn: () => getAssignmentTypeByIdApi(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateAssignmentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssignmentTypeInput) =>
      createAssignmentTypeApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_TYPES_QUERY_KEY });
    },
  });
};

export const useUpdateAssignmentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateAssignmentTypeInput;
    }) => updateAssignmentTypeApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_TYPES_QUERY_KEY });
    },
  });
};

export const useDeleteAssignmentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssignmentTypeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_TYPES_QUERY_KEY });
    },
  });
};
