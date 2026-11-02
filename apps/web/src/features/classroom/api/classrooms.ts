import { apiFetch } from "@/lib/api";
import type {
	Classroom,
	ClassroomListResult,
	CreateClassroomInput,
	UpdateClassroomInput,
} from "../types";

export const getClassroomsApi = async (
	params: { page?: number; limit?: number; search?: string } = {},
): Promise<ClassroomListResult> => {
	const qs = new URLSearchParams();
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	qs.set("page", String(page));
	qs.set("limit", String(limit));
	if (params.search?.trim()) {
		qs.set("search", params.search.trim());
	}

	const response = await apiFetch(`/classrooms?${qs.toString()}`);
	const body = response as {
		data: unknown[];
		meta?: {
			totalData?: number;
			totalPages?: number;
			currentPage?: number;
			perPage?: number;
		};
	};
	const meta = body.meta ?? {
		totalData: 0,
		totalPages: 0,
		currentPage: page,
		perPage: limit,
	};
	return {
		data: body.data as Classroom[],
		meta: {
			page: meta.currentPage ?? page,
			limit: meta.perPage ?? limit,
			total: meta.totalData ?? 0,
			totalPages: meta.totalPages ?? 0,
		},
	};
};

export const getClassroomByIdApi = async (id: string): Promise<Classroom> => {
	const response = await apiFetch(`/classrooms/${id}`);
	const data = (response as { data: Classroom }).data;
	return data;
};

export const createClassroomApi = async (
	input: CreateClassroomInput,
): Promise<Classroom> => {
	const response = await apiFetch("/classrooms", {
		method: "POST",
		body: JSON.stringify(input),
	});
	const data = (response as { data: Classroom }).data;
	return data;
};

export const updateClassroomApi = async (
	id: string,
	input: UpdateClassroomInput,
): Promise<Classroom> => {
	const response = await apiFetch(`/classrooms/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
	const data = (response as { data: Classroom }).data;
	return data;
};

export const deleteClassroomApi = async (
	id: string,
): Promise<{ success: boolean; id: string }> => {
	const response = await apiFetch(`/classrooms/${id}`, { method: "DELETE" });
	const data = (response as { data: { success: boolean; id: string } }).data;
	return data;
};
