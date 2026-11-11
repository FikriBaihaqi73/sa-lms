import { apiFetch } from "@/lib/api";
import type {
	AcademicYearOption,
	ClassSubjectOption,
	CreateStudyPlanInput,
	DepartmentOption,
	StudentOption,
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

function extractArray<T>(res: unknown): T[] {
	if (Array.isArray(res)) return res as T[];
	if (res && typeof res === "object") {
		const record = res as Record<string, unknown>;
		if (Array.isArray(record.data)) return record.data as T[];
		if (record.data && typeof record.data === "object") {
			const nested = record.data as Record<string, unknown>;
			if (Array.isArray(nested.data)) return nested.data as T[];
		}
	}
	return [];
}

export async function getStudyPlansApi(
	params: StudyPlanFilters = {},
): Promise<StudyPlanListResult> {
	const query = new URLSearchParams();
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	query.set("page", String(page));
	query.set("limit", String(limit));

	if (params.search?.trim()) query.set("search", params.search.trim());
	if (params.student_id) query.set("student_id", params.student_id);
	if (params.class_subject_id)
		query.set("class_subject_id", params.class_subject_id);
	if (params.academic_year_id)
		query.set("academic_year_id", params.academic_year_id);
	if (params.department_id) query.set("department_id", params.department_id);

	const response = (await apiFetch(
		`/study-plans?${query.toString()}`,
	)) as ApiResponse<
		StudyPlan[] | { data?: StudyPlan[]; meta?: StudyPlanListResult["meta"] }
	>;

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

	const meta =
		response?.meta ??
		(typeof rawData === "object" && !Array.isArray(rawData)
			? (rawData as { meta?: StudyPlanListResult["meta"] }).meta
			: null);

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
	const response = (await apiFetch(
		`/study-plans/${id}`,
	)) as ApiResponse<StudyPlan>;
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
	return {
		success: response?.data?.success ?? true,
		id: response?.data?.id ?? id,
	};
}

export async function getAcademicYearsOptionsApi(): Promise<
	AcademicYearOption[]
> {
	const response = await apiFetch("/academic-years?page=1&limit=100");
	const items = extractArray<{
		id: string;
		academic_year?: string;
		name?: string;
		year?: string;
		is_active?: boolean;
	}>(response);

	return items.map((ay) => {
		const yearName = ay.academic_year || ay.name || ay.year || "Tahun Ajaran";
		const statusLabel = ay.is_active ? "Aktif" : "Tidak Aktif";
		return {
			id: ay.id,
			academic_year: yearName,
			is_active: Boolean(ay.is_active),
			label: `${yearName} (${statusLabel})`,
		};
	});
}

export async function getDepartmentsOptionsApi(): Promise<DepartmentOption[]> {
	const response = await apiFetch("/departments?page=1&limit=100");
	const items = extractArray<{ id: string; name: string; code: string }>(
		response,
	);
	return items.map((d) => ({
		id: d.id,
		name: d.name,
		code: d.code,
	}));
}

export async function getClassSubjectsOptionsApi(): Promise<
	ClassSubjectOption[]
> {
	const response = await apiFetch("/class-subjects?page=1&limit=100");
	const items = extractArray<{
		id: string;
		class_id?: string;
		classId?: string;
		subject_id?: string;
		subjectId?: string;
		teacher_id?: string;
		teacherId?: string;
		academic_year_id?: string;
		academicYearId?: string;
		class?: { id?: string; name?: string; grade_level?: number | null } | null;
		classes?: {
			id?: string;
			name?: string;
			grade_level?: number | null;
		} | null;
		subject?: {
			id?: string;
			name?: string;
			code?: string | null;
			credits?: number | null;
			departmentId?: string | null;
			department?: { id?: string; name?: string; code?: string | null } | null;
		} | null;
		subjects?: {
			id?: string;
			name?: string;
			code?: string | null;
			credits?: number | null;
			departmentId?: string | null;
			department?: { id?: string; name?: string; code?: string | null } | null;
		} | null;
		teacher?: {
			id?: string;
			teacher_number?: string | null;
			name?: string | null;
			profile?: { fullName?: string | null; full_name?: string | null } | null;
		} | null;
		academic_year?: {
			id?: string;
			academic_year?: string;
			name?: string;
			is_active?: boolean;
		} | null;
		academicYear?: {
			id?: string;
			academic_year?: string;
			name?: string;
			is_active?: boolean;
		} | null;
	}>(response);

	return items.map((cs) => {
		const subjectObj = cs.subject || cs.subjects;
		const classObj = cs.class || cs.classes;
		const ayObj = cs.academic_year || cs.academicYear;

		const subName = subjectObj?.name || "Mata Pelajaran";
		const subCode = subjectObj?.code || "";
		const clsName = classObj?.name || "Kelas";
		const tchName =
			cs.teacher?.profile?.fullName ||
			cs.teacher?.profile?.full_name ||
			cs.teacher?.name ||
			(cs.teacher?.teacher_number
				? `Guru (${cs.teacher.teacher_number})`
				: "Pengajar");
		const credits = subjectObj?.credits ?? 0;
		const codePrefix = subCode ? `[${subCode}] ` : "";
		const label = `${codePrefix}${subName} — ${clsName} (${tchName}) • ${credits} SKS`;

		const academicYearId =
			cs.academic_year_id || cs.academicYearId || ayObj?.id || null;
		const academicYearName = ayObj?.academic_year || ayObj?.name || null;
		const isAcademicYearActive = Boolean(ayObj?.is_active);

		return {
			id: cs.id,
			subjectId: subjectObj?.id,
			subjectName: subName,
			subjectCode: subCode,
			credits,
			className: clsName,
			teacherName: tchName,
			departmentId:
				subjectObj?.department?.id ?? subjectObj?.departmentId ?? null,
			departmentName: subjectObj?.department?.name ?? null,
			academicYearId,
			academicYearName,
			isAcademicYearActive,
			label,
		};
	});
}

export async function getStudentsOptionsApi(): Promise<StudentOption[]> {
	const response = await apiFetch("/students?page=1&limit=100");
	const items = extractArray<{
		id: string;
		studentNumber?: string | null;
		student_number?: string | null;
		departmentId?: string | null;
		department_id?: string | null;
		department?: { id?: string; name?: string } | null;
		classStudents?: Array<{
			classes?: { name?: string };
			class?: { name?: string };
		}> | null;
		profile?: {
			fullName?: string | null;
			full_name?: string | null;
			email?: string | null;
		} | null;
	}>(response);

	return items.map((s) => {
		const sNumber = s.studentNumber || s.student_number || "-";
		const fName =
			s.profile?.fullName ||
			s.profile?.full_name ||
			(sNumber !== "-" ? `Siswa #${sNumber}` : "Siswa");
		const deptName = s.department?.name || null;
		const clsName =
			s.classStudents?.[0]?.classes?.name ||
			s.classStudents?.[0]?.class?.name ||
			null;

		return {
			id: s.id,
			studentNumber: sNumber,
			fullName: fName,
			email: s.profile?.email || null,
			departmentId:
				s.department?.id || s.departmentId || s.department_id || null,
			departmentName: deptName,
			className: clsName,
		};
	});
}
