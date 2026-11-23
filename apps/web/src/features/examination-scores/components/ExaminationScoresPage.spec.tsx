// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createExaminationScoreApi,
	getAcademicYearsApi,
	getClassesApi,
	getClassStudentsApi,
	getExaminationScoresByExamApi,
	getExaminationsApi,
	getGradesApi,
	updateExaminationScoreApi,
} from "../api/examination-scores";
import type {
	AcademicYearOption,
	ClassOption,
	ExaminationOption,
	ExaminationScoreItem,
	StandardGrade,
	StudentParticipant,
} from "../types";
import { ExaminationScoresPage } from "./ExaminationScoresPage";

vi.mock("../api/examination-scores", () => ({
	getAcademicYearsApi: vi.fn(),
	getClassesApi: vi.fn(),
	getExaminationsApi: vi.fn(),
	getClassStudentsApi: vi.fn(),
	getExaminationScoresByExamApi: vi.fn(),
	getGradesApi: vi.fn(),
	createExaminationScoreApi: vi.fn(),
	updateExaminationScoreApi: vi.fn(),
	deleteExaminationScoreApi: vi.fn(),
}));

const mockAcademicYears: AcademicYearOption[] = [
	{
		id: "ay-1",
		name: "2026/2027",
		academic_year: "2026/2027",
		is_active: true,
		label: "2026/2027 (Aktif)",
	},
	{
		id: "ay-2",
		name: "2025/2026",
		academic_year: "2025/2026",
		is_active: false,
		label: "2025/2026",
	},
];

const mockClasses: ClassOption[] = [
	{
		id: "cls-1",
		name: "Kelas Informatika A",
		grade_level: 10,
		academic_year_id: "ay-1",
	},
	{
		id: "cls-2",
		name: "Kelas Informatika B",
		grade_level: 10,
		academic_year_id: "ay-2",
	},
];

const mockExaminations: ExaminationOption[] = [
	{
		id: "exam-1",
		title: "Ujian Akhir Semester (UAS)",
		duration: 90,
		maximumScore: 100,
		examinationDate: "2026-11-20T08:00:00.000Z",
		classSubject: {
			id: "cs-1",
			class: { id: "cls-1", name: "Kelas Informatika A" },
			subject: { id: "sub-1", name: "Pemrograman Web" },
			academic_year: { id: "ay-1", academic_year: "2026/2027" },
		},
		assignmentType: { id: "at-1", name: "Ujian Utama" },
	},
	{
		id: "exam-2",
		title: "Kuis Teori Algoritma",
		duration: 45,
		maximumScore: 100,
		examinationDate: "2026-11-22T08:00:00.000Z",
		classSubject: {
			id: "cs-1",
			class: { id: "cls-1", name: "Kelas Informatika A" },
			subject: { id: "sub-1", name: "Pemrograman Web" },
			academic_year: { id: "ay-1", academic_year: "2026/2027" },
		},
		assignmentType: { id: "at-2", name: "Kuis" },
	},
];

const mockStudents: StudentParticipant[] = [
	{
		studentId: "stu-1",
		studentNumber: "101",
		fullName: "Budi Santoso",
		className: "Kelas Informatika A",
	},
	{
		studentId: "stu-2",
		studentNumber: "102",
		fullName: "Siti Rahma",
		className: "Kelas Informatika A",
	},
	{
		studentId: "stu-3",
		studentNumber: "103",
		fullName: "Ahmad Dahlan",
		className: "Kelas Informatika A",
	},
];

const mockScores: ExaminationScoreItem[] = [
	{
		id: "sc-1",
		examinationId: "exam-1",
		studentId: "stu-1",
		score: 92.5,
		notes: "Pemahaman arsitektur sangat mendalam",
		gradedBy: "u-grader",
		gradedAt: "2026-11-18T09:00:00.000Z",
		createdAt: "2026-11-18T09:00:00.000Z",
		updatedAt: "2026-11-18T09:00:00.000Z",
		grader: {
			id: "u-grader",
			email: "grader@school.ac.id",
			profile: { id: "p-1", fullName: "Dosen Penguji Utama" },
		},
	},
	{
		id: "sc-2",
		examinationId: "exam-1",
		studentId: "stu-2",
		score: 65.0,
		notes: "Perlu bimbingan relasi database",
		gradedBy: "u-grader",
		gradedAt: "2026-11-18T09:30:00.000Z",
		createdAt: "2026-11-18T09:30:00.000Z",
		updatedAt: "2026-11-18T09:30:00.000Z",
		grader: {
			id: "u-grader",
			email: "grader@school.ac.id",
			profile: { id: "p-1", fullName: "Dosen Penguji Utama" },
		},
	},
];

const mockGrades: StandardGrade[] = [
	{
		id: "g-1",
		grade: "A",
		minimumScore: 85,
		maximumScore: 100,
		description: "Sangat Memuaskan",
	},
	{
		id: "g-2",
		grade: "B",
		minimumScore: 70,
		maximumScore: 84.99,
		description: "Baik",
	},
	{
		id: "g-3",
		grade: "C",
		minimumScore: 55,
		maximumScore: 69.99,
		description: "Cukup",
	},
	{
		id: "g-4",
		grade: "D",
		minimumScore: 40,
		maximumScore: 54.99,
		description: "Kurang",
	},
	{
		id: "g-5",
		grade: "E",
		minimumScore: 0,
		maximumScore: 39.99,
		description: "Gagal",
	},
];

describe("ExaminationScoresPage Component", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false, gcTime: 0 },
			},
		});

		vi.mocked(getAcademicYearsApi).mockResolvedValue(mockAcademicYears);
		vi.mocked(getClassesApi).mockResolvedValue(mockClasses);
		vi.mocked(getExaminationsApi).mockResolvedValue(mockExaminations);
		vi.mocked(getClassStudentsApi).mockResolvedValue(mockStudents);
		vi.mocked(getExaminationScoresByExamApi).mockResolvedValue(mockScores);
		vi.mocked(getGradesApi).mockResolvedValue(mockGrades);
		vi.mocked(createExaminationScoreApi).mockResolvedValue({
			id: "sc-new",
			examinationId: "exam-1",
			studentId: "stu-3",
			score: 90,
			notes: "Sangat baik",
			gradedBy: "u-grader",
			gradedAt: "2026-11-18T10:00:00.000Z",
		});
		vi.mocked(updateExaminationScoreApi).mockResolvedValue({
			id: "sc-1",
			examinationId: "exam-1",
			studentId: "stu-1",
			score: 95,
			notes: "Diperbarui",
			gradedBy: "u-grader",
			gradedAt: "2026-11-18T10:05:00.000Z",
		});
	});

	afterEach(() => {
		cleanup();
	});

	const renderComponent = () =>
		render(
			<QueryClientProvider client={queryClient}>
				<ExaminationScoresPage />
			</QueryClientProvider>,
		);

	it("harus merender header, statistik ringkas, dan opsi filter dengan tahun ajaran aktif terpilih", async () => {
		renderComponent();

		// 1. Header
		expect(screen.getByText("EVALUASI & HASIL AKADEMIK")).toBeTruthy();
		expect(screen.getByText("Nilai Ujian (Examination Scores)")).toBeTruthy();
		expect(screen.getByText("Input / Koreksi Nilai")).toBeTruthy();
		expect(screen.getByText("Ekspor Rekap Nilai")).toBeTruthy();

		// 2. Statistik 4 Kartu
		await waitFor(() => {
			expect(screen.getByText("2 / 3")).toBeTruthy(); // 2 dari 3 dinilai
			expect(screen.getByText("67%")).toBeTruthy();
			expect(screen.getByText("1 Siswa")).toBeTruthy(); // 1 belum dinilai
		});

		// Rata-rata skor: (92.5 + 65.0) / 2 = 78.75 -> Grade "B"
		expect(screen.getByText("78.75")).toBeTruthy();
	});

	it("harus menampilkan daftar siswa beserta nilai dan predikat hasil konversi dinamis dari Standar Penilaian", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
			expect(screen.getByText("Siti Rahma")).toBeTruthy();
			expect(screen.getByText("Ahmad Dahlan")).toBeTruthy();
		});

		// Budi: 92.50 -> Grade A
		expect(screen.getByText("92.50")).toBeTruthy();
		const gradeABadges = screen.getAllByText("A");
		expect(gradeABadges.length).toBeGreaterThan(0);

		// Siti: 65.00 -> Grade C
		expect(screen.getByText("65.00")).toBeTruthy();
		const gradeCBadges = screen.getAllByText("C");
		expect(gradeCBadges.length).toBeGreaterThan(0);

		// Ahmad: belum dinilai -> tombol "Input Nilai"
		const inputButtons = screen.getAllByText("Input Nilai");
		expect(inputButtons.length).toBeGreaterThan(0);

		// Budi & Siti memiliki tombol "Edit Nilai"
		const editButtons = screen.getAllByText("Edit Nilai");
		expect(editButtons.length).toBe(2);
	});

	it("harus memfilter daftar siswa berdasarkan input pencarian nama atau NIS", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
		});

		const searchInput = screen.getByPlaceholderText(
			"Cari nama siswa atau NIS/NIM...",
		);
		fireEvent.change(searchInput, { target: { value: "Siti" } });

		expect(screen.getByText("Siti Rahma")).toBeTruthy();
		expect(screen.queryByText("Budi Santoso")).toBeNull();
		expect(screen.queryByText("Ahmad Dahlan")).toBeNull();
	});

	it("harus memfilter siswa berdasarkan status nilai (Sudah Dinilai vs Belum Dinilai)", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
		});

		const statusSelect = screen.getByLabelText(/STATUS NILAI/i);

		// Pilih Belum Dinilai
		fireEvent.change(statusSelect, { target: { value: "ungraded" } });
		expect(screen.getByText("Ahmad Dahlan")).toBeTruthy();
		expect(screen.queryByText("Budi Santoso")).toBeNull();
		expect(screen.queryByText("Siti Rahma")).toBeNull();

		// Pilih Sudah Dinilai
		fireEvent.change(statusSelect, { target: { value: "graded" } });
		expect(screen.getByText("Budi Santoso")).toBeTruthy();
		expect(screen.getByText("Siti Rahma")).toBeTruthy();
		expect(screen.queryByText("Ahmad Dahlan")).toBeNull();
	});

	it("harus menyesuaikan daftar opsi kelas hanya untuk kelas yang ada di tahun ajaran terpilih", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
		});

		// Awalnya tahun ajaran aktif ay-1 terpilih: hanya Kelas Informatika A yang ada di opsi kelas
		expect(
			screen.getByRole("option", { name: "Kelas Informatika A" }),
		).toBeTruthy();
		expect(
			screen.queryByRole("option", { name: "Kelas Informatika B" }),
		).toBeNull();

		// Ganti tahun ajaran ke ay-2 (2025/2026)
		const aySelect = screen.getByLabelText(/TAHUN AJARAN/i);
		fireEvent.change(aySelect, { target: { value: "ay-2" } });

		await waitFor(() => {
			expect(
				screen.getByRole("option", { name: "Kelas Informatika B" }),
			).toBeTruthy();
			expect(
				screen.queryByRole("option", { name: "Kelas Informatika A" }),
			).toBeNull();
		});
	});

	it("harus membuka modal input nilai saat mengklik tombol '+ Input / Koreksi Nilai' dan menyimpan skor baru", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
		});

		// Buka dialog umum
		const topButton = screen.getByText("Input / Koreksi Nilai");
		fireEvent.click(topButton);

		expect(screen.getByText("Input Nilai Ujian Siswa")).toBeTruthy();

		// Pilih siswa Ahmad Dahlan dari select
		const studentSelect = screen.getByRole("combobox", {
			name: "",
		});
		fireEvent.change(studentSelect, { target: { value: "stu-3" } });

		// Masukkan skor menggunakan preset "90"
		const preset90 = screen.getByRole("button", { name: "90" });
		fireEvent.click(preset90);

		const scoreInput = screen.getByLabelText(
			/Skor Nilai Ujian/i,
		) as HTMLInputElement;
		expect(scoreInput.value).toBe("90");

		// Pratinjau predikat live harus menampilkan "A" (rentang 85 - 100)
		expect(
			screen.getByText("Pratinjau Predikat (Standar Penilaian)"),
		).toBeTruthy();

		// Submit form
		const submitBtn = screen.getByRole("button", { name: "Simpan Skor Nilai" });
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(createExaminationScoreApi).toHaveBeenCalledWith(
				expect.objectContaining({
					examinationId: "exam-1",
					studentId: "stu-3",
					score: 90,
				}),
			);
		});
	});

	it("harus membuka modal koreksi nilai dengan data siswa terkunci saat mengklik 'Edit Nilai'", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
		});

		const editButtons = screen.getAllByText("Edit Nilai");
		fireEvent.click(editButtons[0]); // Budi

		expect(screen.getByText("Koreksi Nilai Ujian")).toBeTruthy();
		expect(screen.getByText("Terkunci")).toBeTruthy();

		const scoreInput = screen.getByLabelText(
			/Skor Nilai Ujian/i,
		) as HTMLInputElement;
		expect(scoreInput.value).toBe("92.5");

		// Ubah catatan
		const notesInput = screen.getByLabelText(/Catatan Penguji/i);
		fireEvent.change(notesInput, {
			target: { value: "Catatan evaluasi tambahan" },
		});

		const submitBtn = screen.getByRole("button", { name: "Simpan Skor Nilai" });
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(updateExaminationScoreApi).toHaveBeenCalledWith(
				"sc-1",
				expect.objectContaining({
					score: 92.5,
					notes: "Catatan evaluasi tambahan",
				}),
			);
		});
	});

	it("harus membuka modal audit metadata saat mengklik ikon mata", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
		});

		const auditButtons = screen.getAllByTitle("Lihat Metadata Audit");
		fireEvent.click(auditButtons[0]);

		expect(screen.getByText("Audit Metadata Penilaian")).toBeTruthy();
		expect(screen.getByText("sc-1")).toBeTruthy();
		const graderElements = screen.getAllByText("Dosen Penguji Utama");
		expect(graderElements.length).toBeGreaterThan(0);
		const noteElements = screen.getAllByText(
			"Pemahaman arsitektur sangat mendalam",
		);
		expect(noteElements.length).toBeGreaterThan(0);

		const closeBtns = screen.getAllByRole("button", { name: "Tutup" });
		expect(closeBtns.length).toBeGreaterThan(0);
		fireEvent.click(closeBtns[0]);
	});

	it("harus memicu ekspor file CSV saat mengklik 'Ekspor Rekap Nilai'", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Budi Santoso")).toBeTruthy();
		});

		const createObjectUrlSpy = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:mock-url");
		const revokeObjectUrlSpy = vi
			.spyOn(URL, "revokeObjectURL")
			.mockImplementation(() => {});

		const exportBtn = screen.getByText("Ekspor Rekap Nilai");
		fireEvent.click(exportBtn);

		expect(createObjectUrlSpy).toHaveBeenCalled();
		createObjectUrlSpy.mockRestore();
		revokeObjectUrlSpy.mockRestore();
	});
});
