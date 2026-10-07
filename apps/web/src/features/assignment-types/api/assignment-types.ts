import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  AssignmentType,
  CreateAssignmentTypeInput,
  UpdateAssignmentTypeInput,
} from "../types";

export const getAssignmentTypesApi = async (): Promise<AssignmentType[]> => {
  const response: ApiResponse<AssignmentType[]> =
    await apiFetch("/assignment-types");
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const getAssignmentTypeByIdApi = async (
  id: string,
): Promise<AssignmentType> => {
  const response: ApiResponse<AssignmentType> = await apiFetch(
    `/assignment-types/${id}`,
  );
  return response.data;
};

export const createAssignmentTypeApi = async (
  input: CreateAssignmentTypeInput,
): Promise<AssignmentType> => {
  const response: ApiResponse<AssignmentType> = await apiFetch(
    "/assignment-types",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return response.data;
};

export const updateAssignmentTypeApi = async (
  id: string,
  input: UpdateAssignmentTypeInput,
): Promise<AssignmentType> => {
  const response: ApiResponse<AssignmentType> = await apiFetch(
    `/assignment-types/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return response.data;
};

export const deleteAssignmentTypeApi = async (
  id: string,
): Promise<{ success: boolean; id: string }> => {
  const response: ApiResponse<{ success: boolean; id: string }> =
    await apiFetch(`/assignment-types/${id}`, {
      method: "DELETE",
    });
  return response.data;
};
