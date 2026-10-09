import { apiFetch } from "@/lib/api";
import type {
	ApiResponse,
	CreateInstitutionLevelInput,
	DeleteInstitutionLevelResult,
	InstitutionLevel,
	UpdateInstitutionLevelInput,
} from "../types";

export const getInstitutionLevelsApi = async (): Promise<
	InstitutionLevel[]
> => {
	const response: ApiResponse<InstitutionLevel[]> = await apiFetch(
		"/institution-levels",
	);
	return response.data ?? [];
};

export const getInstitutionLevelByIdApi = async (
	id: string,
): Promise<InstitutionLevel> => {
	const response: ApiResponse<InstitutionLevel> = await apiFetch(
		`/institution-levels/${id}`,
	);
	return response.data;
};

export const createInstitutionLevelApi = async (
	input: CreateInstitutionLevelInput,
): Promise<InstitutionLevel> => {
	const response: ApiResponse<InstitutionLevel> = await apiFetch(
		"/institution-levels",
		{
			method: "POST",
			body: JSON.stringify(input),
		},
	);
	return response.data;
};

export const updateInstitutionLevelApi = async (
	id: string,
	input: UpdateInstitutionLevelInput,
): Promise<InstitutionLevel> => {
	const response: ApiResponse<InstitutionLevel> = await apiFetch(
		`/institution-levels/${id}`,
		{
			method: "PATCH",
			body: JSON.stringify(input),
		},
	);
	return response.data;
};

export const deleteInstitutionLevelApi = async (
	id: string,
): Promise<DeleteInstitutionLevelResult> => {
	const response: ApiResponse<DeleteInstitutionLevelResult> = await apiFetch(
		`/institution-levels/${id}`,
		{
			method: "DELETE",
		},
	);
	return response.data;
};
