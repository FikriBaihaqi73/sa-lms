import { apiFetch } from "@/lib/api";
import type {
	BatchCreateClassStudentsInput,
	CandidateStudentItem,
	ClassOption,
	ClassStudentItem,
	ClassStudentListResult,
	ClassStudentPageMeta,
	ClassStudentsSummary,
	CreateClassStudentInput,
	GetClassStudentsParams,
} from "../types";

interface ApiResponse<T> {
	status?: string;
	message?: string;
	data: T;
	meta?: {
		page?: number;
		limit?: number;
		total?: number;
		totalPages?: number;
	};
}

function unwrapClassStudents(
	rawResponse: unknown,
	fallbackPage: number,
	fallbackLimit: number,
): ClassStudentListResult {
	let curr = rawResponse as Record<string, unknown> | null | undefined;
	let foundMeta: ClassStudentPageMeta | null = null;

	while (curr && typeof curr === "object" && !Array.isArray(curr)) {
		if (curr.meta && typeof curr.meta === "object") {
			const m = curr.meta as Record<string, unknown>;
			foundMeta = {
				page: typeof m.page === "number" ? m.page : fallbackPage,
				limit: typeof m.limit === "number" ? m.limit : fallbackLimit,
				total: typeof m.total === "number" ? m.total : 0,
				totalPages: typeof m.totalPages === "number" ? m.totalPages : 1,
			};
		}
		if ("data" in curr) {
			if (Array.isArray(curr.data)) {
				const list = curr.data as ClassStudentItem[];
				return {
					data: list,
					meta: foundMeta ?? {
						page: fallbackPage,
						limit: fallbackLimit,
						total: list.length,
						totalPages: 1,
					},
				};
			}
			curr = curr.data as Record<string, unknown> | null | undefined;
		} else {
			break;
		}
	}

	if (Array.isArray(curr)) {
		const list = curr as ClassStudentItem[];
		return {
			data: list,
			meta: foundMeta ?? {
				page: fallbackPage,
				limit: fallbackLimit,
				total: list.length,
				totalPages: 1,
			},
		};
	}

	return {
		data: [],
		meta: foundMeta ?? {
			page: fallbackPage,
			limit: fallbackLimit,
			total: 0,
			totalPages: 1,
		},
	};
}

/**
 * Mengambil daftar penempatan siswa ke kelas dengan pagination dan pencarian.
 */
export async function getClassStudentsApi(
	params: GetClassStudentsParams = {},
): Promise<ClassStudentListResult> {
	const qs = new URLSearchParams();
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	qs.set("page", String(page));
	qs.set("limit", String(limit));

	if (params.search?.trim()) {
		qs.set("search", params.search.trim());
	}
	if (params.classId) {
		qs.set("classId", params.classId);
	}
	if (params.status) {
		qs.set("status", params.status);
	}

	const rawResponse: unknown = await apiFetch(
		`/class-students?${qs.toString()}`,
	);

	return unwrapClassStudents(rawResponse, page, limit);
}

/**
 * Mengambil ringkasan empat kartu penempatan siswa.
 * Endpoint ini didaftarkan sebagai kebutuhan backend jika backend mengembalikan 404.
 */
export async function getClassStudentsSummaryApi(
	classId?: string,
): Promise<ClassStudentsSummary> {
	const qs = classId ? `?classId=${encodeURIComponent(classId)}` : "";
	const response: ApiResponse<ClassStudentsSummary> = await apiFetch(
		`/class-students/summary${qs}`,
	);
	return response.data;
}

/**
 * Menambahkan satu penempatan siswa ke kelas.
 */
export async function createClassStudentApi(
	input: CreateClassStudentInput,
): Promise<ClassStudentItem> {
	const response: ApiResponse<ClassStudentItem> = await apiFetch(
		"/class-students",
		{
			method: "POST",
			body: JSON.stringify(input),
		},
	);
	return response.data;
}

/**
 * Menambahkan beberapa siswa ke kelas sekaligus.
 * Mencoba endpoint batch terlebih dahulu, dan fallback ke panggilan berulang jika backend belum mendukung batch create.
 */
export async function batchCreateClassStudentsApi(
	input: BatchCreateClassStudentsInput,
): Promise<{ count: number }> {
	try {
		const response: ApiResponse<{ count: number }> = await apiFetch(
			"/class-students/batch",
			{
				method: "POST",
				body: JSON.stringify(input),
			},
		);
		return response.data ?? { count: input.studentIds.length };
	} catch {
		// Fallback: jalankan per siswa satu per satu
		await Promise.all(
			input.studentIds.map((studentId) =>
				createClassStudentApi({ classId: input.classId, studentId }),
			),
		);
		return { count: input.studentIds.length };
	}
}

/**
 * Mengeluarkan siswa dari kelas (soft delete).
 */
export async function deleteClassStudentApi(
	id: string,
): Promise<{ id: string }> {
	await apiFetch(`/class-students/${id}`, {
		method: "DELETE",
	});
	return { id };
}

/**
 * Mengeluarkan beberapa siswa dari kelas sekaligus.
 */
export async function batchDeleteClassStudentsApi(
	ids: string[],
): Promise<{ count: number }> {
	await Promise.all(ids.map((id) => deleteClassStudentApi(id)));
	return { count: ids.length };
}

/**
 * Memulihkan siswa yang pernah dikeluarkan kembali ke kelas.
 * Memanggil POST /class-students/:id/restore jika didukung backend.
 */
export async function restoreClassStudentApi(
	id: string,
): Promise<ClassStudentItem> {
	const response: ApiResponse<ClassStudentItem> = await apiFetch(
		`/class-students/${id}/restore`,
		{
			method: "POST",
		},
	);
	return response.data;
}

/**
 * Mengambil daftar opsi kelas untuk dropdown.
 */
export async function getClassesOptionsApi(): Promise<ClassOption[]> {
	interface RawClass {
		id: string;
		name: string;
		academic_year?: {
			academic_year?: string;
		} | null;
	}
	const response: ApiResponse<RawClass[]> =
		await apiFetch("/classes?limit=100");
	const rawList = response.data ?? [];
	return rawList.map((c) => ({
		id: c.id,
		name: c.name,
		academicYear: c.academic_year?.academic_year ?? null,
	}));
}

/**
 * Mengambil kandidat siswa untuk modal tambah ke kelas.
 * Mencoba endpoint kandidat, dan fallback ke /students?limit=100 jika endpoint kandidat belum tersedia.
 */
export async function getCandidateStudentsApi(
	classId: string,
): Promise<CandidateStudentItem[]> {
	try {
		const response: ApiResponse<CandidateStudentItem[]> = await apiFetch(
			`/class-students/candidates?classId=${encodeURIComponent(classId)}`,
		);
		return response.data ?? [];
	} catch {
		// Fallback: ambil daftar siswa aktif dari /students
		interface RawStudent {
			id: string;
			studentNumber: string;
			profile?: {
				fullName?: string;
			} | null;
		}
		const response: ApiResponse<RawStudent[]> = await apiFetch(
			"/students?limit=100",
		);
		const rawStudents = response.data ?? [];
		return rawStudents.map((s) => ({
			id: s.id,
			studentNumber: s.studentNumber,
			fullName: s.profile?.fullName || `Siswa #${s.studentNumber}`,
			isPreviouslyRemoved: false,
			currentClassName: null,
		}));
	}
}
