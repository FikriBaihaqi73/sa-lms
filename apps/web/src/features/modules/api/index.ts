import { apiFetch } from "@/lib/api";
import type {
	ClassSubjectOption,
	CreateModuleInput,
	LearningModule,
	ModuleListResponse,
	ModuleParams,
	UpdateModuleInput,
} from "../types";

export async function getModules(
	params: ModuleParams = {},
): Promise<ModuleListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		limit: String(params.limit ?? 10),
	});

	if (params.search?.trim()) {
		query.set("search", params.search.trim());
	}
	if (params.class_subject_id?.trim()) {
		query.set("class_subject_id", params.class_subject_id.trim());
	}

	const response = (await apiFetch(
		`/modules?${query.toString()}`,
	)) as ModuleListResponse;

	if (
		!response ||
		!Array.isArray(response.data) ||
		!response.meta ||
		typeof response.meta.totalPages !== "number"
	) {
		throw new Error("Respons daftar modul pembelajaran tidak valid.");
	}

	return response;
}

export async function getModuleById(id: string): Promise<LearningModule> {
	const response = (await apiFetch(`/modules/${encodeURIComponent(id)}`)) as {
		data: LearningModule | null;
	};

	if (!response?.data) {
		throw new Error("Data modul pembelajaran tidak ditemukan.");
	}

	return response.data;
}

export async function createModule(
	input: CreateModuleInput,
): Promise<LearningModule> {
	const response = (await apiFetch("/modules", {
		method: "POST",
		body: JSON.stringify(input),
	})) as { data: LearningModule };

	return response.data;
}

export async function updateModule(
	id: string,
	input: UpdateModuleInput,
): Promise<LearningModule> {
	const response = (await apiFetch(`/modules/${encodeURIComponent(id)}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	})) as { data: LearningModule };

	return response.data;
}

export async function deleteModule(id: string): Promise<{ success: boolean; id: string }> {
	const response = (await apiFetch(`/modules/${encodeURIComponent(id)}`, {
		method: "DELETE",
	})) as { data?: { success: boolean; id: string } };

	return response?.data ?? { success: true, id };
}

export async function getClassSubjectOptions(): Promise<ClassSubjectOption[]> {
	try {
		const response = (await apiFetch("/class-subjects?page=1&limit=100")) as {
			data?: Array<{
				id: string;
				class?: { name?: string | null } | null;
				subject?: { name?: string | null; code?: string | null } | null;
				teacher?: {
					teacher_number?: string | null;
					profile?: { fullName?: string | null } | null;
				} | null;
				academic_year?: { academic_year?: string | null } | null;
			}>;
		};

		const list = response?.data ?? [];
		return list.map((item) => {
			const className = item.class?.name || "Tanpa Kelas";
			const subjectName = item.subject?.name || "Tanpa Mapel";
			const teacherName =
				item.teacher?.profile?.fullName ||
				item.teacher?.teacher_number ||
				"Tanpa Guru";
			const academicYear = item.academic_year?.academic_year || "—";
			return {
				id: item.id,
				label: `${className} • ${subjectName} (${teacherName})`,
				className,
				subjectName,
				teacherName,
				academicYear,
			};
		});
	} catch {
		return [];
	}
}
