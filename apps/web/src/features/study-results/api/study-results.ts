import { apiFetch } from "@/lib/api";
import type {
	AcademicStatusOption,
	AcademicYearOption,
	ClassOption,
	CreateStudyResultInput,
	DepartmentOption,
	SemesterOption,
	StudentOption,
	StudyResult,
	StudyResultFilters,
	StudyResultListResponse,
	UpdateStudyResultInput,
} from "../types";

interface ApiResponse<T> {
	status: string;
	code: number;
	message: string;
	data: T;
	meta?: {
		totalData?: number;
		totalPages?: number;
		currentPage?: number;
		perPage?: number;
		total?: number;
		page?: number;
		limit?: number;
	};
}

export async function getStudyResultsApi(
	filters: StudyResultFilters = {},
): Promise<StudyResultListResponse> {
	const query = new URLSearchParams();
	if (filters.page) query.set("page", String(filters.page));
	if (filters.limit) query.set("limit", String(filters.limit));
	if (filters.search?.trim()) query.set("search", filters.search.trim());
	if (filters.academicYearId)
		query.set("academicYearId", filters.academicYearId);
	if (filters.semesterId) query.set("semesterId", filters.semesterId);
	if (filters.departmentId) query.set("departmentId", filters.departmentId);
	if (filters.classId) query.set("classId", filters.classId);
	if (filters.academicStatusId)
		query.set("academicStatusId", filters.academicStatusId);

	const endpoint = `/study-results${query.toString() ? `?${query.toString()}` : ""}`;
	const res = (await apiFetch(endpoint)) as ApiResponse<StudyResult[]>;

	return {
		data: res.data || [],
		meta: {
			totalData:
				res.meta?.totalData ?? res.meta?.total ?? (res.data || []).length,
			totalPages: res.meta?.totalPages ?? 1,
			currentPage: res.meta?.currentPage ?? res.meta?.page ?? filters.page ?? 1,
			perPage: res.meta?.perPage ?? res.meta?.limit ?? filters.limit ?? 10,
		},
	};
}

export async function getStudyResultByIdApi(id: string): Promise<StudyResult> {
	const res = (await apiFetch(
		`/study-results/${id}`,
	)) as ApiResponse<StudyResult>;
	return res.data;
}

export async function createStudyResultApi(
	data: CreateStudyResultInput,
): Promise<StudyResult> {
	const res = (await apiFetch("/study-results", {
		method: "POST",
		body: JSON.stringify(data),
	})) as ApiResponse<StudyResult>;
	return res.data;
}

export async function updateStudyResultApi(
	id: string,
	data: UpdateStudyResultInput,
): Promise<StudyResult> {
	const res = (await apiFetch(`/study-results/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	})) as ApiResponse<StudyResult>;
	return res.data;
}

export async function deleteStudyResultApi(
	id: string,
): Promise<{ success: boolean; id: string }> {
	const res = (await apiFetch(`/study-results/${id}`, {
		method: "DELETE",
	})) as ApiResponse<{ success: boolean; id: string }>;
	return res.data;
}

export async function getDepartmentsOptionsApi(): Promise<DepartmentOption[]> {
	try {
		const res = (await apiFetch(
			"/departments?page=1&limit=100",
		)) as ApiResponse<Array<{ id: string; name: string; code: string }>>;
		return (res.data || []).map((d) => ({
			id: d.id,
			name: d.name,
			code: d.code,
		}));
	} catch {
		return [];
	}
}

export async function getClassesOptionsApi(): Promise<ClassOption[]> {
	try {
		const res = (await apiFetch("/classes?page=1&limit=100")) as ApiResponse<
			Array<{ id: string; name: string; grade_level?: number }>
		>;
		return (res.data || []).map((c) => ({
			id: c.id,
			name: c.name,
			grade_level: c.grade_level,
		}));
	} catch {
		return [];
	}
}

export async function getAcademicYearsOptionsApi(): Promise<
	AcademicYearOption[]
> {
	try {
		const res = (await apiFetch(
			"/academic-years?page=1&limit=100",
		)) as ApiResponse<
			Array<{ id: string; academic_year: string; is_active?: boolean }>
		>;
		return (res.data || []).map((ay) => ({
			id: ay.id,
			academic_year: ay.academic_year,
			is_active: ay.is_active,
		}));
	} catch {
		return [];
	}
}

export async function getSemestersOptionsApi(): Promise<SemesterOption[]> {
	try {
		const res = (await apiFetch("/semesters?page=1&limit=100")) as ApiResponse<
			Array<{ id: string; name: string; is_active?: boolean }>
		>;
		return (res.data || []).map((s) => ({
			id: s.id,
			name: s.name,
			is_active: s.is_active,
		}));
	} catch {
		return [];
	}
}

export async function getAcademicStatusesOptionsApi(): Promise<
	AcademicStatusOption[]
> {
	try {
		const res = (await apiFetch(
			"/academic-statuses?page=1&limit=100",
		)) as ApiResponse<Array<{ id: string; name: string }>>;
		return (res.data || []).map((as) => ({
			id: as.id,
			name: as.name,
		}));
	} catch {
		return [];
	}
}

export async function getStudentsOptionsApi(): Promise<StudentOption[]> {
	try {
		const res = (await apiFetch("/students?page=1&limit=200")) as ApiResponse<
			Array<{
				id: string;
				studentNumber: string;
				profile?: { fullName?: string | null } | null;
			}>
		>;
		return (res.data || []).map((s) => ({
			id: s.id,
			studentNumber: s.studentNumber,
			fullName: s.profile?.fullName || `Siswa (${s.studentNumber})`,
		}));
	} catch {
		return [];
	}
}
