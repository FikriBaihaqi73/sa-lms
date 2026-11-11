// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	getAcademicYearsOptionsApi,
	getClassSubjectsOptionsApi,
	getDepartmentsOptionsApi,
	getStudentsOptionsApi,
	getStudyPlansApi,
} from "../api";
import type { StudyPlan } from "../types";
import { StudyPlansPage } from "./study-plans-page";

vi.mock("../api", () => ({
	getStudyPlansApi: vi.fn(),
	getStudyPlanByIdApi: vi.fn(),
	createStudyPlanApi: vi.fn(),
	updateStudyPlanApi: vi.fn(),
	deleteStudyPlanApi: vi.fn(),
	getAcademicYearsOptionsApi: vi.fn(),
	getClassSubjectsOptionsApi: vi.fn(),
	getDepartmentsOptionsApi: vi.fn(),
	getStudentsOptionsApi: vi.fn(),
}));

const mockStudyPlan: StudyPlan = {
	id: "sp-1",
	student_id: "stu-1",
	class_subject_id: "cs-1",
	academic_year_id: "ay-1",
	created_at: "2026-11-11T00:00:00.000Z",
	updated_at: "2026-11-11T00:00:00.000Z",
	student: {
		id: "stu-1",
		studentNumber: "1001",
		profile: {
			fullName: "Fajar Nugraha",
			email: "fajar@example.com",
		},
	},
	classSubject: {
		id: "cs-1",
		class_id: "class-1",
		subject_id: "sub-1",
		teacher_id: "tch-1",
		academic_year_id: "ay-1",
		class: {
			id: "class-1",
			name: "X-RPL-1",
		},
		subject: {
			id: "sub-1",
			name: "Pemrograman Dasar",
			code: "PRG-101",
			credits: 3,
			department: {
				id: "dept-1",
				name: "Teknik Informatika",
				code: "TI",
			},
		},
		teacher: {
			id: "tch-1",
			teacher_number: "T001",
			profile: {
				fullName: "Hendra Wijaya",
			},
		},
	},
	academicYear: {
		id: "ay-1",
		academic_year: "2026/2027",
		is_active: true,
	},
};

function renderPage() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<StudyPlansPage />
		</QueryClientProvider>,
	);
}

describe("StudyPlansPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		vi.mocked(getStudyPlansApi).mockResolvedValue({
			data: [mockStudyPlan],
			meta: {
				currentPage: 1,
				perPage: 10,
				totalData: 1,
				totalPages: 1,
			},
		});

		vi.mocked(getAcademicYearsOptionsApi).mockResolvedValue([
			{
				id: "ay-1",
				academic_year: "2026/2027",
				is_active: true,
				label: "2026/2027 (Aktif)",
			},
		]);

		vi.mocked(getDepartmentsOptionsApi).mockResolvedValue([
			{ id: "dept-1", name: "Teknik Informatika", code: "TI" },
		]);

		vi.mocked(getClassSubjectsOptionsApi).mockResolvedValue([
			{
				id: "cs-1",
				subjectName: "Pemrograman Dasar",
				subjectCode: "PRG-101",
				credits: 3,
				className: "X-RPL-1",
				teacherName: "Hendra Wijaya",
				departmentId: "dept-1",
				departmentName: "Teknik Informatika",
				academicYearId: "ay-1",
				academicYearName: "2026/2027",
				isAcademicYearActive: true,
				label: "[PRG-101] Pemrograman Dasar — X-RPL-1 (Hendra Wijaya) • 3 SKS",
			},
		]);

		vi.mocked(getStudentsOptionsApi).mockResolvedValue([
			{
				id: "stu-1",
				studentNumber: "1001",
				fullName: "Fajar Nugraha",
				email: "fajar@example.com",
			},
			{
				id: "stu-2",
				studentNumber: "1002",
				fullName: "Galih Pratama",
				email: "galih@example.com",
			},
		]);
	});

	afterEach(cleanup);

	it("renders page header, 4 stats cards, view switcher tabs, filter bar, and student table", async () => {
		renderPage();

		// 1. Header
		expect(
			screen.getByText("DATA AKADEMIK • SELF-ENROLLMENT & MONITORING"),
		).toBeTruthy();
		expect(screen.getByText("Rencana Studi (KRS)")).toBeTruthy();
		expect(screen.getByText("Ekspor KRS")).toBeTruthy();
		expect(screen.getByText("+ Tambah / Force Enroll KRS")).toBeTruthy();

		// 2. 4 Stat Cards
		expect(screen.getByText("SISWA SUDAH KRS")).toBeTruthy();
		expect(screen.getByText("TOTAL PENGAMBILAN")).toBeTruthy();
		expect(screen.getByText("KELAS / MAPEL AKTIF")).toBeTruthy();
		expect(screen.getByText("SISWA BELUM KRS")).toBeTruthy();

		// 3. View Switcher Tabs
		expect(screen.getByText("Rekap per Siswa & SKS")).toBeTruthy();
		expect(screen.getByText("Katalog Mapel Kelas")).toBeTruthy();
		expect(screen.getByText("Log Transaksi KRS")).toBeTruthy();

		// 4. Student in student_view table
		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();
		expect(await screen.findByText("Galih Pratama")).toBeTruthy();
		expect(screen.getByText("Sudah KRS")).toBeTruthy();
		expect(screen.getByText("Belum KRS")).toBeTruthy();
	});

	it("switches to catalog view and log view when clicking tab buttons", async () => {
		renderPage();

		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();

		// Switch to Katalog Mapel Kelas tab
		const catalogTab = screen.getByRole("button", {
			name: /Katalog Mapel Kelas/i,
		});
		fireEvent.click(catalogTab);

		expect(await screen.findByText("KODE & MATA PELAJARAN")).toBeTruthy();
		expect(screen.getByText("BIDANG")).toBeTruthy();
		expect(screen.getByText("KELAS")).toBeTruthy();
		expect(screen.getByText("BOBOT KREDIT")).toBeTruthy();
		expect(
			screen.getByLabelText(/Toggle status mapel Pemrograman Dasar/i),
		).toBeTruthy();

		// Switch to Log Transaksi KRS tab
		const logTab = screen.getByRole("button", {
			name: /Log Transaksi KRS/i,
		});
		fireEvent.click(logTab);

		expect(await screen.findByText("TANGGAL DIBUAT")).toBeTruthy();
		expect(screen.getByText("Baris per halaman:")).toBeTruthy();
	});

	it("opens modal dialog when clicking '+ Tambah / Force Enroll KRS'", async () => {
		renderPage();

		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();

		const addBtn = screen.getByRole("button", {
			name: /\+ Tambah \/ Force Enroll KRS/i,
		});
		fireEvent.click(addBtn);

		expect(
			await screen.findByText("INTERVENSI ADMIN (FORCE ENROLL)"),
		).toBeTruthy();
		expect(screen.getByText("Tambah Rencana Studi Manual")).toBeTruthy();
		expect(screen.queryByText("Tampilkan juga kelas yang ditutup")).toBeNull();

		const dialog = screen.getByRole("dialog");
		expect(dialog).toBeTruthy();
		expect(within(dialog).getByLabelText(/Siswa \/ Mahasiswa/i)).toBeTruthy();
		expect(within(dialog).getByLabelText(/Bidang \/ Departemen/i)).toBeTruthy();
		expect(within(dialog).getByLabelText(/Mata Pelajaran Kelas/i)).toBeTruthy();
	});

	it("expands student row to show enrolled subjects with drop button", async () => {
		renderPage();

		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();

		// Find Rincian buttons
		const rincianBtns = screen.getAllByRole("button", { name: /Rincian/i });
		expect(rincianBtns.length).toBeGreaterThan(0);

		const firstRincian = rincianBtns[0];
		if (firstRincian) {
			fireEvent.click(firstRincian);
		}

		// Detail card should show subject name, credits, and Drop button
		expect(
			await screen.findByText("Daftar Mata Pelajaran KRS — Fajar Nugraha"),
		).toBeTruthy();
		expect(screen.getByText("Drop / Hapus")).toBeTruthy();
	});

	it("filters student list when typing in search input", async () => {
		renderPage();

		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();
		expect(screen.getByText("Galih Pratama")).toBeTruthy();

		const searchInput = screen.getByPlaceholderText(
			/Cari nama siswa, NIS\/NIM, kode atau nama mata pelajaran.../i,
		);
		fireEvent.change(searchInput, { target: { value: "Galih" } });

		await waitFor(() => {
			expect(screen.queryByText("Fajar Nugraha")).toBeNull();
			expect(screen.getByText("Galih Pratama")).toBeTruthy();
		});
	});

	it("persists deactivated mapel status and hides deactivated mapel from add/force enroll modal", async () => {
		// Mock another class subject in a different department
		vi.mocked(getClassSubjectsOptionsApi).mockResolvedValue([
			{
				id: "cs-1",
				subjectName: "Pemrograman Dasar",
				subjectCode: "PRG-101",
				credits: 3,
				className: "X-RPL-1",
				teacherName: "Hendra Wijaya",
				departmentId: "dept-1",
				departmentName: "Teknik Informatika",
				academicYearId: "ay-1",
				academicYearName: "2026/2027",
				isAcademicYearActive: true,
				label: "[PRG-101] Pemrograman Dasar — X-RPL-1 (Hendra Wijaya) • 3 SKS",
			},
			{
				id: "cs-2",
				subjectName: "Basis Data",
				subjectCode: "DB-101",
				credits: 4,
				className: "X-RPL-2",
				teacherName: "Dewi Lestari",
				departmentId: "dept-1",
				departmentName: "Teknik Informatika",
				academicYearId: "ay-1",
				academicYearName: "2026/2027",
				isAcademicYearActive: true,
				label: "[DB-101] Basis Data — X-RPL-2 (Dewi Lestari) • 4 SKS",
			},
		]);

		renderPage();

		// Switch to catalog view
		const catalogTab = screen.getByRole("button", {
			name: /Katalog Mapel Kelas/i,
		});
		fireEvent.click(catalogTab);

		expect(await screen.findByText("Pemrograman Dasar")).toBeTruthy();
		const toggleBtn = screen.getByLabelText(
			/Toggle status mapel Pemrograman Dasar/i,
		);
		expect(toggleBtn).toBeTruthy();

		// Toggle to deactivate
		fireEvent.click(toggleBtn);

		// Open Add Modal
		const addBtn = screen.getByRole("button", {
			name: /\+ Tambah \/ Force Enroll KRS/i,
		});
		fireEvent.click(addBtn);

		const dialog = await screen.findByRole("dialog");
		const mapelSelect = within(dialog).getByLabelText(
			/Mata Pelajaran Kelas/i,
		) as HTMLSelectElement;

		// Deactivated subject "cs-1" (Pemrograman Dasar) must NOT appear as an option in the modal
		const options = Array.from(mapelSelect.options).map((opt) => opt.text);
		expect(options.some((txt) => txt.includes("Pemrograman Dasar"))).toBe(
			false,
		);
		expect(options.some((txt) => txt.includes("Basis Data"))).toBe(true);
	});
});
