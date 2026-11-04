import { apiFetch } from "@/lib/api";
import type {
	CreateStudyPlanInput,
	StudyPlan,
	StudyPlanFilters,
	StudyPlanListResult,
	UpdateStudyPlanInput,
} from "../types";

interface ApiResponse<T> {
	status?: string;
	code?: number;
	message?: string;
	data: T;
	meta?: {
		totalData?: number;
		totalPages?: number;
		currentPage?: number;
		perPage?: number;
	};
}

export async function getStudyPlansApi(
	params: StudyPlanFilters = {},
): Promise<StudyPlanListResult> {
	const query = new URLSearchParams();
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;

	query.set("page", String(page));
	query.set("limit", String(limit));

	if (params.search?.trim()) {
		query.set("search", params.search.trim());
	}
	if (params.student_id) {
		query.set("student_id", params.student_id);
	}
	if (params.class_subject_id) {
		query.set("class_subject_id", params.class_subject_id);
	}
	if (params.academic_year_id) {
		query.set("academic_year_id", params.academic_year_id);
	}

	const response = (await apiFetch(
		`/study-plans?${query.toString()}`,
	)) as ApiResponse<StudyPlan[] | { data?: StudyPlan[]; meta?: StudyPlanListResult["meta"] }>;

	const rawData = response?.data;
	let items: StudyPlan[] = [];

	if (Array.isArray(rawData)) {
		items = rawData;
	} else if (
		rawData &&
		typeof rawData === "object" &&
		Array.isArray((rawData as { data?: StudyPlan[] }).data)
	) {
		items = (rawData as { data: StudyPlan[] }).data;
	}

	const meta = response?.meta ?? (typeof rawData === "object" && !Array.isArray(rawData) ? (rawData as { meta?: StudyPlanListResult["meta"] }).meta : null);

	return {
		data: items,
		meta: {
			totalData: meta?.totalData ?? items.length,
			totalPages: meta?.totalPages ?? 1,
			currentPage: meta?.currentPage ?? page,
			perPage: meta?.perPage ?? limit,
		},
	};
}

export async function getStudyPlanByIdApi(id: string): Promise<StudyPlan> {
	const response = (await apiFetch(`/study-plans/${id}`)) as ApiResponse<StudyPlan>;
	return response.data;
}

export async function createStudyPlanApi(
	input: CreateStudyPlanInput,
): Promise<StudyPlan> {
	const response = (await apiFetch("/study-plans", {
		method: "POST",
		body: JSON.stringify(input),
	})) as ApiResponse<StudyPlan>;
	return response.data;
}

export async function updateStudyPlanApi(
	id: string,
	input: UpdateStudyPlanInput,
): Promise<StudyPlan> {
	const response = (await apiFetch(`/study-plans/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	})) as ApiResponse<StudyPlan>;
	return response.data;
}

export async function deleteStudyPlanApi(
	id: string,
): Promise<{ success: boolean; id: string }> {
	const response = (await apiFetch(`/study-plans/${id}`, {
		method: "DELETE",
	})) as ApiResponse<{ success?: boolean; id: string }>;
	return { success: response?.data?.success ?? true, id: response?.data?.id ?? id };
}

