import { apiFetch } from "@/lib/api";
import type {
	AcademicYearOption,
	AssignmentFilters,
	AssignmentItem,
	AssignmentSubmissionItem,
	AssignmentTypeItem,
	ClassOption,
	CreateAssignmentPayload,
	LearningModuleOption,
	UpdateAssignmentPayload,
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

export async function getAssignmentsApi(
	params: AssignmentFilters = {},
): Promise<{
	data: AssignmentItem[];
	meta: {
		totalData: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}> {
	const query = new URLSearchParams();
	const page = params.page ?? 1;
	const limit = params.limit ?? 50;
	query.set("page", String(page));
	query.set("limit", String(limit));
	if (params.search?.trim()) query.set("search", params.search.trim());

	const response = (await apiFetch(
		`/assignments?${query.toString()}`,
	)) as ApiResponse<AssignmentItem[]>;

	const list = Array.isArray(response.data) ? response.data : [];
	return {
		data: list,
		meta: {
			totalData: response.meta?.totalData ?? list.length,
			totalPages: response.meta?.totalPages ?? 1,
			currentPage: response.meta?.currentPage ?? page,
			perPage: response.meta?.perPage ?? limit,
		},
	};
}

export async function getAssignmentByIdApi(
	id: string,
): Promise<AssignmentItem> {
	const response = (await apiFetch(
		`/assignments/${id}`,
	)) as ApiResponse<AssignmentItem>;
	return response.data;
}

export async function createAssignmentApi(
	payload: CreateAssignmentPayload,
): Promise<AssignmentItem> {
	const response = (await apiFetch("/assignments", {
		method: "POST",
		body: JSON.stringify(payload),
	})) as ApiResponse<AssignmentItem>;
	return response.data;
}

export async function updateAssignmentApi(
	id: string,
	payload: UpdateAssignmentPayload,
): Promise<AssignmentItem> {
	const response = (await apiFetch(`/assignments/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	})) as ApiResponse<AssignmentItem>;
	return response.data;
}

export async function deleteAssignmentApi(
	id: string,
): Promise<{ success: boolean; id: string }> {
	const response = (await apiFetch(`/assignments/${id}`, {
		method: "DELETE",
	})) as ApiResponse<{ success: boolean; id: string }>;
	return response.data;
}

export async function getAssignmentSubmissionsApi(
	params: { assignmentId?: string; search?: string } = {},
): Promise<AssignmentSubmissionItem[]> {
	const query = new URLSearchParams();
	query.set("page", "1");
	query.set("limit", "100");
	if (params.search) query.set("search", params.search);

	const response = (await apiFetch(
		`/assignment-submissions?${query.toString()}`,
	)) as ApiResponse<AssignmentSubmissionItem[]>;

	const list = Array.isArray(response.data) ? response.data : [];
	if (params.assignmentId) {
		return list.filter((s) => s.assignmentId === params.assignmentId);
	}
	return list;
}

export async function getAssignmentTypesOptionsApi(): Promise<
	AssignmentTypeItem[]
> {
	try {
		const response = (await apiFetch(
			"/assignment-types?page=1&limit=50",
		)) as ApiResponse<AssignmentTypeItem[]>;
		return Array.isArray(response.data) ? response.data : [];
	} catch {
		return [];
	}
}

export async function getModulesOptionsApi(): Promise<LearningModuleOption[]> {
	try {
		const response = (await apiFetch(
			"/modules?page=1&limit=100",
		)) as ApiResponse<LearningModuleOption[]>;
		return Array.isArray(response.data) ? response.data : [];
	} catch {
		return [];
	}
}

export async function getClassesOptionsApi(
	academicYearId?: string,
): Promise<ClassOption[]> {
	try {
		const query = new URLSearchParams();
		query.set("page", "1");
		query.set("limit", "100");
		if (academicYearId) query.set("academic_year_id", academicYearId);

		const response = (await apiFetch(`/classes?${query.toString()}`)) as {
			data?: Array<{
				id: string;
				name: string;
				academic_year_id?: string | null;
				academicYearId?: string | null;
				academic_year?: { id?: string | null } | null;
				department?: { name?: string | null } | null;
			}>;
		};
		const items = Array.isArray(response.data) ? response.data : [];
		return items.map((c) => {
			const ayId =
				c.academic_year_id ?? c.academicYearId ?? c.academic_year?.id ?? null;
			return {
				id: c.id,
				name: c.name,
				departmentName: c.department?.name || undefined,
				academic_year_id: ayId,
				academicYearId: ayId,
			};
		});
	} catch {
		return [];
	}
}

export async function getAcademicYearsOptionsApi(): Promise<
	AcademicYearOption[]
> {
	try {
		const response = (await apiFetch("/academic-years?page=1&limit=50")) as {
			data?: Array<{ id: string; academic_year: string; is_active: boolean }>;
		};
		const items = Array.isArray(response.data) ? response.data : [];
		return items.map((ay) => ({
			id: ay.id,
			academic_year: ay.academic_year,
			is_active: ay.is_active,
			label: `${ay.academic_year} (${ay.is_active ? "Aktif" : "Tidak Aktif"})`,
		}));
	} catch {
		return [];
	}
}

export async function getClassStudentsOptionsApi(classId?: string): Promise<
	Array<{
		id: string;
		studentId: string;
		fullName: string;
		studentNumber: string;
		email: string;
		className: string;
	}>
> {
	if (!classId) return [];
	try {
		const query = new URLSearchParams();
		query.set("page", "1");
		query.set("limit", "100");
		query.set("classId", classId);

		const response = (await apiFetch(
			`/class-students?${query.toString()}`,
		)) as {
			data?: Array<{
				id: string;
				classId?: string;
				class_id?: string;
				student_id?: string;
				studentId?: string;
				student?: {
					id: string;
					studentNumber?: string;
					profile?: { fullName?: string; email?: string };
				};
				class?: { id?: string; name?: string };
			}>;
		};

		const items = Array.isArray(response.data) ? response.data : [];
		const matchingItems = items.filter((cs) => {
			const csClassId = cs.classId ?? cs.class_id ?? cs.class?.id;
			return !csClassId || csClassId === classId;
		});
		return matchingItems.map((cs) => {
			const stId = cs.student?.id || cs.student_id || cs.studentId || cs.id;
			return {
				id: cs.id,
				studentId: stId,
				fullName:
					cs.student?.profile?.fullName ||
					`Siswa #${cs.student?.studentNumber || cs.id.slice(0, 4)}`,
				studentNumber: cs.student?.studentNumber || "-",
				email: cs.student?.profile?.email || "-",
				className: cs.class?.name || "Kelas",
			};
		});
	} catch {
		return [];
	}
}
