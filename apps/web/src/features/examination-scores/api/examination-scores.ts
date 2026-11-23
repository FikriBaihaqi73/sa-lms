import { apiFetch } from "@/lib/api";
import type {
	AcademicYearOption,
	ClassOption,
	CreateScoreInput,
	ExaminationOption,
	ExaminationScoreItem,
	StandardGrade,
	StudentParticipant,
	UpdateScoreInput,
} from "../types";

interface ApiResponse<T> {
	status: string;
	code: number;
	message: string;
	data: T | null;
}

function extractArray<T>(payload: unknown): T[] {
	if (Array.isArray(payload)) return payload as T[];
	if (payload && typeof payload === "object") {
		const obj = payload as { data?: unknown };
		if (Array.isArray(obj.data)) return obj.data as T[];
		if (obj.data && typeof obj.data === "object") {
			const nested = obj.data as { data?: unknown };
			if (Array.isArray(nested.data)) return nested.data as T[];
		}
	}
	return [];
}

/**
 * Mengambil daftar Tahun Ajaran
 */
export async function getAcademicYearsApi(): Promise<AcademicYearOption[]> {
	try {
		const response = (await apiFetch(
			"/academic-years?limit=100",
		)) as ApiResponse<unknown>;
		const rawItems = extractArray<Record<string, unknown>>(response);
		return rawItems.map((ay) => {
			const id = String(ay.id ?? "");
			const academicYear = String(
				ay.academic_year ?? ay.academicYear ?? ay.name ?? "Tahun Ajaran",
			);
			const isActive = Boolean(ay.is_active ?? ay.isActive);
			return {
				id,
				name: academicYear,
				academic_year: academicYear,
				is_active: isActive,
				label: `${academicYear} (${isActive ? "Aktif" : "Tidak Aktif"})`,
			};
		});
	} catch {
		return [];
	}
}

/**
 * Mengambil daftar Kelas
 */
export async function getClassesApi(
	academicYearId?: string,
): Promise<ClassOption[]> {
	try {
		const endpoint = academicYearId
			? `/classes?academicYearId=${encodeURIComponent(academicYearId)}&limit=100`
			: "/classes?limit=100";
		const response = (await apiFetch(endpoint)) as ApiResponse<unknown>;
		const rawItems = extractArray<Record<string, unknown>>(response);
		return rawItems.map((c) => {
			const ayId = c.academic_year_id
				? String(c.academic_year_id)
				: c.academicYearId
					? String(c.academicYearId)
					: c.academic_year && typeof c.academic_year === "object"
						? String((c.academic_year as { id?: string }).id ?? "")
						: undefined;

			return {
				id: String(c.id ?? ""),
				name: String(c.name ?? "Kelas"),
				grade_level:
					typeof c.grade_level === "number" ? c.grade_level : undefined,
				academic_year_id: ayId,
			};
		});
	} catch {
		return [];
	}
}

/**
 * Mengambil daftar Ujian (Examinations)
 */
export async function getExaminationsApi(): Promise<ExaminationOption[]> {
	try {
		const response = (await apiFetch(
			"/examinations?limit=100",
		)) as ApiResponse<unknown>;
		const rawItems = extractArray<Record<string, unknown>>(response);
		return rawItems.map((ex) => {
			const classSubject = ex.classSubject as
				| Record<string, unknown>
				| undefined;
			const classObj = classSubject?.class as
				| Record<string, unknown>
				| undefined;
			const subjectObj = classSubject?.subject as
				| Record<string, unknown>
				| undefined;
			const ayObj = classSubject?.academic_year as
				| Record<string, unknown>
				| undefined;
			const assignmentType = ex.assignmentType as
				| Record<string, unknown>
				| undefined;

			return {
				id: String(ex.id ?? ""),
				title: String(ex.title ?? ""),
				description: ex.description ? String(ex.description) : null,
				examinationDate: ex.examinationDate ? String(ex.examinationDate) : null,
				duration: typeof ex.duration === "number" ? ex.duration : null,
				maximumScore:
					typeof ex.maximumScore === "number"
						? ex.maximumScore
						: Number(ex.maximumScore) || null,
				classSubjectId: ex.classSubjectId ? String(ex.classSubjectId) : null,
				classSubject: classSubject
					? {
							id: String(classSubject.id ?? ""),
							class: classObj
								? {
										id: String(classObj.id ?? ""),
										name: String(classObj.name ?? ""),
										institution_id: classObj.institution_id
											? String(classObj.institution_id)
											: undefined,
									}
								: null,
							subject: subjectObj
								? {
										id: String(subjectObj.id ?? ""),
										name: String(subjectObj.name ?? ""),
									}
								: null,
							academic_year: ayObj
								? {
										id: String(ayObj.id ?? ""),
										academic_year: String(ayObj.academic_year ?? ""),
									}
								: null,
						}
					: null,
				assignmentType: assignmentType
					? {
							id: String(assignmentType.id ?? ""),
							name: String(assignmentType.name ?? ""),
						}
					: null,
			};
		});
	} catch {
		return [];
	}
}

/**
 * Mengambil daftar peserta siswa dalam satu kelas
 */
export async function getClassStudentsApi(
	classId: string,
): Promise<StudentParticipant[]> {
	if (!classId) return [];
	try {
		const response = (await apiFetch(
			`/class-students?classId=${encodeURIComponent(classId)}&limit=200`,
		)) as ApiResponse<unknown>;
		const rawItems = extractArray<Record<string, unknown>>(response);

		return rawItems
			.map((item) => {
				const student = (item.student ?? item) as Record<string, unknown>;
				const profile = (student.profile ?? {}) as Record<string, unknown>;
				const studentId = String(
					student.id ?? item.studentId ?? item.student_id ?? "",
				);
				const studentNumber = String(
					student.studentNumber ?? student.student_number ?? "-",
				);
				const fullName = String(
					profile.fullName ?? profile.full_name ?? "Siswa",
				);
				const classObj = (item.classes ?? item.class) as
					| Record<string, unknown>
					| undefined;
				const className = classObj?.name ? String(classObj.name) : undefined;

				return {
					studentId,
					studentNumber,
					fullName,
					className,
				};
			})
			.filter((s) => Boolean(s.studentId));
	} catch {
		return [];
	}
}

/**
 * Mengambil data nilai ujian spesifik untuk satu examinationId
 */
export async function getExaminationScoresByExamApi(
	examinationId: string,
): Promise<ExaminationScoreItem[]> {
	if (!examinationId) return [];
	const response = (await apiFetch(
		`/examination-scores/examination/${encodeURIComponent(examinationId)}`,
	)) as ApiResponse<unknown>;
	const rawItems = extractArray<Record<string, unknown>>(response);

	return rawItems.map((item) => {
		const grader = item.grader as Record<string, unknown> | undefined;
		const graderProfile = grader?.profile as
			| Record<string, unknown>
			| undefined;
		const student = item.student as Record<string, unknown> | undefined;
		const studentProfile = student?.profile as
			| Record<string, unknown>
			| undefined;
		const examination = item.examination as Record<string, unknown> | undefined;

		return {
			id: String(item.id ?? ""),
			examinationId: String(item.examinationId ?? item.examination_id ?? ""),
			studentId: String(item.studentId ?? item.student_id ?? ""),
			score: item.score != null ? Number(item.score) : null,
			notes: item.notes ? String(item.notes) : null,
			gradedBy: item.gradedBy ? String(item.gradedBy) : null,
			gradedAt: item.gradedAt ? String(item.gradedAt) : null,
			createdAt: item.createdAt ? String(item.createdAt) : undefined,
			updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
			grader: grader
				? {
						id: String(grader.id ?? ""),
						email: grader.email ? String(grader.email) : undefined,
						profile: graderProfile
							? {
									id: String(graderProfile.id ?? ""),
									fullName: String(graderProfile.fullName ?? ""),
								}
							: null,
					}
				: null,
			student: student
				? {
						id: String(student.id ?? ""),
						studentNumber: String(
							student.studentNumber ?? student.student_number ?? "-",
						),
						profile: studentProfile
							? {
									id: String(studentProfile.id ?? ""),
									fullName: String(studentProfile.fullName ?? ""),
								}
							: null,
					}
				: null,
			examination: examination
				? {
						id: String(examination.id ?? ""),
						title: String(examination.title ?? ""),
						maximumScore:
							examination.maximumScore != null
								? Number(examination.maximumScore)
								: null,
					}
				: null,
		};
	});
}

/**
 * Mengambil data master Standar Penilaian (/grades)
 */
export async function getGradesApi(): Promise<StandardGrade[]> {
	try {
		const response = (await apiFetch("/grades")) as ApiResponse<unknown>;
		const rawItems = extractArray<Record<string, unknown>>(response);

		return rawItems.map((item) => ({
			id: String(item.id ?? ""),
			grade: String(item.grade ?? ""),
			minimumScore:
				item.minimumScore != null ? Number(item.minimumScore) : null,
			maximumScore:
				item.maximumScore != null ? Number(item.maximumScore) : null,
			description: item.description ? String(item.description) : null,
			createdAt: item.createdAt ? String(item.createdAt) : undefined,
			updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
		}));
	} catch {
		return [];
	}
}

/**
 * Menambahkan nilai ujian baru
 */
export async function createExaminationScoreApi(
	input: CreateScoreInput,
): Promise<ExaminationScoreItem> {
	const payload: Record<string, unknown> = {
		examinationId: input.examinationId,
		studentId: input.studentId,
	};
	if (input.score !== undefined && input.score !== null)
		payload.score = Number(input.score);
	if (input.notes !== undefined && input.notes !== null)
		payload.notes = input.notes.trim();

	const response = (await apiFetch("/examination-scores", {
		method: "POST",
		body: JSON.stringify(payload),
	})) as ApiResponse<ExaminationScoreItem>;

	if (!response.data) throw new Error("Gagal menyimpan nilai ujian.");
	return response.data;
}

/**
 * Memperbarui nilai ujian yang sudah ada
 */
export async function updateExaminationScoreApi(
	id: string,
	input: UpdateScoreInput,
): Promise<ExaminationScoreItem> {
	const payload: Record<string, unknown> = {};
	if (input.score !== undefined)
		payload.score = input.score !== null ? Number(input.score) : undefined;
	if (input.notes !== undefined)
		payload.notes = input.notes ? input.notes.trim() : "";

	const response = (await apiFetch(
		`/examination-scores/${encodeURIComponent(id)}`,
		{
			method: "PATCH",
			body: JSON.stringify(payload),
		},
	)) as ApiResponse<ExaminationScoreItem>;

	if (!response.data) throw new Error("Gagal memperbarui nilai ujian.");
	return response.data;
}

/**
 * Menghapus record nilai ujian
 */
export async function deleteExaminationScoreApi(id: string): Promise<void> {
	await apiFetch(`/examination-scores/${encodeURIComponent(id)}`, {
		method: "DELETE",
	});
}
