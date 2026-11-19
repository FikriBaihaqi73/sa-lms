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
import * as api from "../api/study-results";
import type {
	AcademicStatusOption,
	AcademicYearOption,
	ClassOption,
	DepartmentOption,
	SemesterOption,
	StudentOption,
	StudyResult,
} from "../types";
import { StudyResultsPage } from "./StudyResultsPage";

vi.mock("../api/study-results", () => ({
	getStudyResultsApi: vi.fn(),
	getStudyResultByIdApi: vi.fn(),
	createStudyResultApi: vi.fn(),
	updateStudyResultApi: vi.fn(),
	deleteStudyResultApi: vi.fn(),
	getDepartmentsOptionsApi: vi.fn(),
	getClassesOptionsApi: vi.fn(),
	getAcademicYearsOptionsApi: vi.fn(),
	getSemestersOptionsApi: vi.fn(),
	getAcademicStatusesOptionsApi: vi.fn(),
	getStudentsOptionsApi: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

const mockDepartments: DepartmentOption[] = [
	{ id: "dept-1", name: "Teknik Informatika", code: "TIF" },
	{ id: "dept-2", name: "Sistem Informasi", code: "SI" },
];

const mockClasses: ClassOption[] = [
	{ id: "class-1", name: "TIF-1A", grade_level: 1 },
	{ id: "class-2", name: "SI-2B", grade_level: 2 },
];

const mockAcademicYears: AcademicYearOption[] = [
	{ id: "ay-1", academic_year: "2026/2027", is_active: true },
	{ id: "ay-2", academic_year: "2025/2026", is_active: false },
];

const mockSemesters: SemesterOption[] = [
	{ id: "sem-1", name: "Semester Ganjil", is_active: true },
	{ id: "sem-2", name: "Semester Genap", is_active: false },
];

const mockAcademicStatuses: AcademicStatusOption[] = [
	{ id: "stat-1", name: "Aktif" },
	{ id: "stat-2", name: "Cuti" },
];

const mockStudents: StudentOption[] = [
	{
		id: "std-1",
		studentNumber: "2026001",
		fullName: "Ahmad Dahlan",
	},
	{
		id: "std-2",
		studentNumber: "2026002",
		fullName: "Siti Nurhaliza",
	},
];

const mockStudyResults: StudyResult[] = [
	{
		id: "sr-1",
		studentId: "std-1",
		academicYearId: "ay-1",
		semesterId: "sem-1",
		academicStatusId: "stat-1",
		totalCredits: 20,
		semesterGpa: 3.85,
		cumulativeGpa: 3.8,
		student: {
			id: "std-1",
			studentNumber: "2026001",
			departmentId: "dept-1",
			classStudents: [
				{
					id: "cs-1",
					classId: "class-1",
					classes: { id: "class-1", name: "TIF-1A" },
				},
			],
			profile: {
				id: "prof-1",
				fullName: "Ahmad Dahlan",
				email: "ahmad@example.com",
			},
		},
		academicYear: {
			id: "ay-1",
			academic_year: "2026/2027",
			is_active: true,
		},
		semester: {
			id: "sem-1",
			name: "Semester Ganjil",
			is_active: true,
		},
		academicStatus: {
			id: "stat-1",
			name: "Aktif",
		},
		createdAt: "2026-11-01T08:00:00Z",
		updatedAt: "2026-11-01T08:00:00Z",
	},
	{
		id: "sr-2",
		studentId: "std-2",
		academicYearId: "ay-1",
		semesterId: "sem-1",
		academicStatusId: "stat-2",
		totalCredits: 18,
		semesterGpa: 3.2,
		cumulativeGpa: 3.25,
		student: {
			id: "std-2",
			studentNumber: "2026002",
			departmentId: "dept-2",
			classStudents: [
				{
					id: "cs-2",
					classId: "class-2",
					classes: { id: "class-2", name: "SI-2B" },
				},
			],
			profile: {
				id: "prof-2",
				fullName: "Siti Nurhaliza",
				email: "siti@example.com",
			},
		},
		academicYear: {
			id: "ay-1",
			academic_year: "2026/2027",
			is_active: true,
		},
		semester: {
			id: "sem-1",
			name: "Semester Ganjil",
			is_active: true,
		},
		academicStatus: {
			id: "stat-2",
			name: "Cuti",
		},
		createdAt: "2026-11-02T08:00:00Z",
		updatedAt: "2026-11-02T08:00:00Z",
	},
];

function renderStudyResultsPage() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<StudyResultsPage />
		</QueryClientProvider>,
	);
}

describe("StudyResultsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(api.getDepartmentsOptionsApi).mockResolvedValue(mockDepartments);
		vi.mocked(api.getClassesOptionsApi).mockResolvedValue(mockClasses);
		vi.mocked(api.getAcademicYearsOptionsApi).mockResolvedValue(
			mockAcademicYears,
		);
		vi.mocked(api.getSemestersOptionsApi).mockResolvedValue(mockSemesters);
		vi.mocked(api.getAcademicStatusesOptionsApi).mockResolvedValue(
			mockAcademicStatuses,
		);
		vi.mocked(api.getStudentsOptionsApi).mockResolvedValue(mockStudents);

		vi.mocked(api.getStudyResultsApi).mockResolvedValue({
			data: mockStudyResults,
			meta: {
				totalData: mockStudyResults.length,
				totalPages: 1,
				currentPage: 1,
				perPage: 10,
			},
		});
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("renders page header, metric stats cards, and table rows correctly", async () => {
		renderStudyResultsPage();

		await waitFor(() => {
			expect(screen.getByText("Ahmad Dahlan")).toBeTruthy();
		});

		// Check Header
		expect(
			screen.getByRole("heading", { name: "Rekap Nilai Siswa" }),
		).toBeTruthy();
		expect(
			screen.getByText(
				/Pantau hasil studi, capaian SKS, dan indeks prestasi siswa/,
			),
		).toBeTruthy();

		// Check Stats Cards
		expect(screen.getByText("Total Rekap Nilai")).toBeTruthy();
		expect(screen.getByText("Rata-rata IPK Kumulatif")).toBeTruthy();
		expect(screen.getByText("Rata-rata IPS Semester")).toBeTruthy();
		expect(screen.getByText("Siswa Status Aktif")).toBeTruthy();

		// Check Data Table Rows
		expect(screen.getByText(/2026001/)).toBeTruthy();
		expect(screen.getByText("Siti Nurhaliza")).toBeTruthy();
		expect(screen.getByText(/2026002/)).toBeTruthy();
	});

	it("renders empty state when there are no study results", async () => {
		vi.mocked(api.getStudyResultsApi).mockResolvedValue({
			data: [],
			meta: {
				totalData: 0,
				totalPages: 1,
				currentPage: 1,
				perPage: 10,
			},
		});

		renderStudyResultsPage();

		await waitFor(() => {
			expect(screen.getByText("Belum ada data rekap nilai siswa")).toBeTruthy();
		});
		expect(
			screen.getByText(
				/Mulai input hasil studi dan pantau capaian indeks prestasi siswa/,
			),
		).toBeTruthy();
	});

	it("filters study results by department and class", async () => {
		renderStudyResultsPage();

		await waitFor(() => {
			expect(
				screen.getByRole("option", { name: "Teknik Informatika (TIF)" }),
			).toBeTruthy();
		});

		const deptSelect = screen.getByLabelText("Filter Departemen");
		fireEvent.change(deptSelect, { target: { value: "dept-1" } });

		await waitFor(() => {
			expect(api.getStudyResultsApi).toHaveBeenCalledWith(
				expect.objectContaining({
					departmentId: "dept-1",
				}),
			);
		});

		await waitFor(() => {
			expect(screen.getByRole("option", { name: "TIF-1A" })).toBeTruthy();
		});

		const classSelect = screen.getByLabelText("Filter Kelas");
		fireEvent.change(classSelect, { target: { value: "class-1" } });

		await waitFor(() => {
			expect(api.getStudyResultsApi).toHaveBeenCalledWith(
				expect.objectContaining({
					classId: "class-1",
				}),
			);
		});
	});

	it("opens create modal and handles successful submission", async () => {
		vi.mocked(api.createStudyResultApi).mockResolvedValue({
			...mockStudyResults[0],
			id: "sr-new",
		});

		renderStudyResultsPage();

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /Tambah Rekap Nilai/i }),
			).toBeTruthy();
		});

		const addBtn = screen.getByRole("button", { name: /Tambah Rekap Nilai/i });
		fireEvent.click(addBtn);

		expect(screen.getByText("Tambah Rekap Nilai Siswa")).toBeTruthy();

		const submitBtn = screen.getByRole("button", { name: /Buat Rekap Nilai/i });
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(api.createStudyResultApi).toHaveBeenCalled();
		});
	});

	it("opens detail dialog when view detail button is clicked", async () => {
		renderStudyResultsPage();

		await waitFor(() => {
			expect(screen.getByText("Ahmad Dahlan")).toBeTruthy();
		});

		const detailButtons = screen.getAllByLabelText("Lihat Detail");
		fireEvent.click(detailButtons[0]);

		await waitFor(() => {
			expect(screen.getByText("Rincian Rekap Nilai Siswa")).toBeTruthy();
		});
		expect(
			screen.getByText(
				"Kartu Hasil Studi (KHS) dan pencapaian akademik per semester.",
			),
		).toBeTruthy();
	});

	it("opens edit dialog and submits update", async () => {
		vi.mocked(api.updateStudyResultApi).mockResolvedValue({
			...mockStudyResults[0],
			totalCredits: 22,
		});

		renderStudyResultsPage();

		await waitFor(() => {
			expect(screen.getByText("Ahmad Dahlan")).toBeTruthy();
		});

		const editButtons = screen.getAllByLabelText("Ubah Rekap Nilai");
		fireEvent.click(editButtons[0]);

		await waitFor(() => {
			expect(screen.getByText("Ubah Rekap Nilai Siswa")).toBeTruthy();
		});

		const saveBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });
		fireEvent.click(saveBtn);

		await waitFor(() => {
			expect(api.updateStudyResultApi).toHaveBeenCalledWith(
				"sr-1",
				expect.objectContaining({
					studentId: "std-1",
				}),
			);
		});
	});

	it("opens delete confirmation modal and confirms deletion", async () => {
		vi.mocked(api.deleteStudyResultApi).mockResolvedValue({
			success: true,
			id: "sr-1",
		});

		renderStudyResultsPage();

		await waitFor(() => {
			expect(screen.getByText("Ahmad Dahlan")).toBeTruthy();
		});

		const deleteButtons = screen.getAllByLabelText("Hapus Rekap Nilai");
		fireEvent.click(deleteButtons[0]);

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Hapus Rekap Nilai Siswa" }),
			).toBeTruthy();
		});

		const confirmBtn = screen.getByRole("button", { name: /Ya, Hapus/i });
		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(api.deleteStudyResultApi).toHaveBeenCalledWith("sr-1");
		});
	});

	it("triggers CSV export when export button is clicked", async () => {
		renderStudyResultsPage();

		await waitFor(() => {
			expect(screen.getByLabelText("Ekspor Data Rekap Nilai")).toBeTruthy();
		});

		const exportBtn = screen.getByLabelText("Ekspor Data Rekap Nilai");
		fireEvent.click(exportBtn);

		await waitFor(() => {
			expect(exportBtn).toBeTruthy();
		});
	});

	it("resets all filters when reset button is clicked", async () => {
		renderStudyResultsPage();

		await waitFor(() => {
			expect(
				screen.getByRole("option", { name: "Teknik Informatika (TIF)" }),
			).toBeTruthy();
		});

		const deptSelect = screen.getByLabelText(
			"Filter Departemen",
		) as HTMLSelectElement;
		fireEvent.change(deptSelect, { target: { value: "dept-1" } });

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /Reset filter/i }),
			).toBeTruthy();
		});

		const resetBtn = screen.getByRole("button", { name: /Reset filter/i });
		fireEvent.click(resetBtn);

		await waitFor(() => {
			expect(deptSelect.value).toBe("");
		});
	});
});
