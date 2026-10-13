
import { apiFetch } from "@/lib/api";
import type {
	ApiResponse,
	CreateAcademicYearInput,
	AcademicYear,
	UpdateAcademicYearInput,
} from "../types";

export const listAcademicYearsApi = async (): Promise<AcademicYear[]> => {
	const response: ApiResponse<AcademicYear[]> = await apiFetch("/academic-years");
	return response.data ?? [];
};

export const createAcademicYearApi = async (
	input: CreateAcademicYearInput,
): Promise<AcademicYear> => {
	const response: ApiResponse<AcademicYear> = await apiFetch("/academic-years", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const updateAcademicYearApi = async (
	id: string,
	input: UpdateAcademicYearInput,
): Promise<AcademicYear> => {
	const response: ApiResponse<AcademicYear> = await apiFetch(
		`/academic-years/${id}`,
		{
			method: "PATCH",
			body: JSON.stringify(input),
		},
	);
	return response.data;
};

export const deleteAcademicYearApi = async (
	id: string,
): Promise<{ id: string }> => {
	const response: ApiResponse<{ id: string; success?: boolean }> =
		await apiFetch(`/academic-years/${id}`, { method: "DELETE" });
	return { id: response.data?.id ?? id };
};
