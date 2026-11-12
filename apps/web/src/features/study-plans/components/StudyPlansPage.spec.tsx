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
		expect(
			within(dialog).getByLabelText(/1\. SISWA \/ MAHASISWA/i),
		).toBeTruthy();
		expect(within(dialog).getByLabelText(/2\. TAHUN AJARAN/i)).toBeTruthy();
		expect(
			within(dialog).getByText(/3\. PILIH BIDANG \/ DEPARTEMEN/i),
		).toBeTruthy();
		expect(within(dialog).getByText(/4\. PILIH MATA PELAJARAN/i)).toBeTruthy();
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

		// Deactivated subject "cs-1" (Pemrograman Dasar) must NOT appear in the modal
		expect(within(dialog).queryByText("Pemrograman Dasar")).toBeNull();
		// Active subject "cs-2" (Basis Data) must be visible
		expect(within(dialog).getByText("Basis Data")).toBeTruthy();
	});

	it("supports single-select pill department filtering and multi-select subjects with SKS quota calculator and 24 SKS limit validation", async () => {
		vi.mocked(getClassSubjectsOptionsApi).mockResolvedValue([
			{
				id: "cs-10",
				subjectName: "Pemrograman Web",
				subjectCode: "WEB-101",
				credits: 4,
				className: "XII-RPL-1",
				teacherName: "Hendra Wijaya",
				departmentId: "dept-1",
				departmentName: "Teknik Informatika",
				academicYearId: "ay-1",
				academicYearName: "2026/2027",
				isAcademicYearActive: true,
				label: "[WEB-101] Pemrograman Web",
			},
			{
				id: "cs-11",
				subjectName: "Pendidikan Pancasila",
				subjectCode: "PP-101",
				credits: 18,
				className: "XII-UMUM",
				teacherName: "Budi Santoso",
				departmentId: null,
				departmentName: null,
				academicYearId: "ay-1",
				academicYearName: "2026/2027",
				isAcademicYearActive: true,
				label: "[PP-101] Pendidikan Pancasila",
			},
		]);

		renderPage();

		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();
		expect(
			(await screen.findAllByText("2026/2027 (Aktif)")).length,
		).toBeGreaterThan(0);

		const addBtn = screen.getByRole("button", {
			name: /\+ Tambah \/ Force Enroll KRS/i,
		});
		fireEvent.click(addBtn);

		const dialog = await screen.findByRole("dialog");

		// Pill for Teknik Informatika is active by default
		const tiPill = within(dialog).getByRole("button", {
			name: /Teknik Informatika/i,
		});
		const umumPill = within(dialog).getByRole("button", {
			name: /Umum \/ Tanpa Bidang/i,
		});
		expect(tiPill).toBeTruthy();
		expect(umumPill).toBeTruthy();
		expect(await within(dialog).findByText("Pemrograman Web")).toBeTruthy();

		// Click on "Umum / Tanpa Bidang" pill
		fireEvent.click(umumPill);

		// Now Pendidikan Pancasila is visible and Pemrograman Web is filtered out
		expect(
			await within(dialog).findByText("Pendidikan Pancasila"),
		).toBeTruthy();
		expect(within(dialog).queryByText("Pemrograman Web")).toBeNull();

		// Check the checkbox for Pendidikan Pancasila (18 SKS)
		const ppCheckbox = within(dialog).getByLabelText("Pendidikan Pancasila");
		fireEvent.click(ppCheckbox);

		// Switch back to "Teknik Informatika" pill
		fireEvent.click(tiPill);

		// Check the checkbox for Pemrograman Web (4 SKS)
		const webCheckbox = await within(dialog).findByLabelText("Pemrograman Web");
		fireEvent.click(webCheckbox);

		// Total selected = 3 (initial) + 18 + 4 = 25 SKS (> 24 SKS max quota)
		// Should show "Kredit siswa tidak mencukupi!" alert
		expect(
			within(dialog).getByText("Kredit siswa tidak mencukupi!"),
		).toBeTruthy();
		expect(
			within(dialog).getByText(/melebihi batas maksimal 24 SKS/i),
		).toBeTruthy();

		// Simpan button should be disabled
		const saveBtn = within(dialog).getByRole("button", {
			name: /Simpan/i,
		});
		expect(saveBtn.hasAttribute("disabled")).toBe(true);

		// Uncheck Pemrograman Web to reduce SKS back to 21 (3 + 18)
		fireEvent.click(webCheckbox);

		// Alert should disappear and Simpan button should be enabled
		expect(
			within(dialog).queryByText("Kredit siswa tidak mencukupi!"),
		).toBeNull();
		expect(saveBtn.hasAttribute("disabled")).toBe(false);
	});

	it("searches and filters students in the searchable student combobox within Add modal", async () => {
		renderPage();

		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();

		// Open Add Modal
		const addBtn = screen.getByRole("button", {
			name: /\+ Tambah \/ Force Enroll KRS/i,
		});
		fireEvent.click(addBtn);

		const dialog = await screen.findByRole("dialog");
		expect(dialog).toBeTruthy();

		// Click the combobox trigger button
		const studentCombobox = within(dialog).getByRole("combobox", {
			name: /1\. SISWA \/ MAHASISWA/i,
		});
		expect(studentCombobox).toBeTruthy();
		fireEvent.click(studentCombobox);

		// Sticky search input should appear with placeholder
		const searchInput = await within(dialog).findByPlaceholderText(
			"Cari nama siswa, email, atau NIS/NIM...",
		);
		expect(searchInput).toBeTruthy();
		expect(
			within(dialog).getByText(/Menampilkan 2 dari 2 siswa/i),
		).toBeTruthy();

		// Type "Galih" into search input
		fireEvent.change(searchInput, { target: { value: "Galih" } });

		// Should filter out Fajar and display Galih with updated count
		expect(
			within(dialog).getByText(/Menampilkan 1 dari 2 siswa/i),
		).toBeTruthy();
		const listbox = within(dialog).getByRole("listbox");
		expect(within(listbox).queryByText("Fajar Nugraha")).toBeNull();
		expect(within(listbox).getByText("Galih Pratama")).toBeTruthy();

		// Type non-matching string
		fireEvent.change(searchInput, { target: { value: "TidakAdaSiswa123" } });
		expect(
			within(dialog).getByText(
				"Siswa tidak ditemukan untuk kata kunci tersebut.",
			),
		).toBeTruthy();

		// Click clear (X) button to reset search input
		const clearBtn = within(dialog).getByLabelText(
			"Hapus kata kunci pencarian",
		);
		fireEvent.click(clearBtn);
		expect(
			within(dialog).getByText(/Menampilkan 2 dari 2 siswa/i),
		).toBeTruthy();

		// Select Galih Pratama
		const galihOption = within(listbox).getByRole("option", {
			name: /Galih Pratama/i,
		});
		fireEvent.click(galihOption);

		// Combobox popover should be closed and trigger label updated
		expect(within(dialog).queryByRole("listbox")).toBeNull();
		expect(
			within(dialog).getByText(/Galih Pratama \(galih@example\.com\)/i),
		).toBeTruthy();
	});

	it("dynamically updates department pills in modal and filter options in main bar based on selected academic year", async () => {
		// Mock two academic years: ay-1 (2026/2027) with dept-1, and ay-2 (2027/2028) with dept-2 and no TI
		vi.mocked(getAcademicYearsOptionsApi).mockResolvedValue([
			{
				id: "ay-1",
				academic_year: "2026/2027",
				is_active: true,
				label: "2026/2027 (Aktif)",
			},
			{
				id: "ay-2",
				academic_year: "2027/2028",
				is_active: false,
				label: "2027/2028 (Tidak Aktif)",
			},
		]);

		vi.mocked(getDepartmentsOptionsApi).mockResolvedValue([
			{ id: "dept-1", name: "Teknik Informatika", code: "TI" },
			{ id: "dept-2", name: "Desain Komunikasi Visual", code: "DKV" },
		]);

		vi.mocked(getClassSubjectsOptionsApi).mockResolvedValue([
			{
				id: "cs-ay1",
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
				label: "[PRG-101] Pemrograman Dasar",
			},
			{
				id: "cs-ay2",
				subjectName: "Animasi 2D",
				subjectCode: "DKV-201",
				credits: 4,
				className: "XI-DKV-1",
				teacherName: "Rudi Hartono",
				departmentId: "dept-2",
				departmentName: "Desain Komunikasi Visual",
				academicYearId: "ay-2",
				academicYearName: "2027/2028",
				isAcademicYearActive: false,
				label: "[DKV-201] Animasi 2D",
			},
		]);

		renderPage();

		expect(await screen.findByText("Fajar Nugraha")).toBeTruthy();

		// In main filter bar, department dropdown for active AY (ay-1) should ONLY have Teknik Informatika, not DKV
		const deptFilter = screen.getByLabelText("Pilih Bidang / Departemen");
		expect(within(deptFilter).getByText(/Teknik Informatika/i)).toBeTruthy();
		expect(
			within(deptFilter).queryByText(/Desain Komunikasi Visual/i),
		).toBeNull();

		// Select Teknik Informatika in main filter
		fireEvent.change(deptFilter, { target: { value: "dept-1" } });
		expect((deptFilter as HTMLSelectElement).value).toBe("dept-1");

		// Change main filter academic year to ay-2 (2027/2028)
		const ayFilter = screen.getByLabelText("Pilih Tahun Ajaran");
		fireEvent.change(ayFilter, { target: { value: "ay-2" } });

		// Since dept-1 is not in ay-2, departmentId should automatically reset to "" ("Semua Bidang / Departemen")
		await waitFor(() => {
			expect((deptFilter as HTMLSelectElement).value).toBe("");
			expect(
				within(deptFilter).getByText(/Desain Komunikasi Visual/i),
			).toBeTruthy();
			expect(within(deptFilter).queryByText(/Teknik Informatika/i)).toBeNull();
		});

		// Now open Add Modal to verify dynamic pills per academic year
		const addBtn = screen.getByRole("button", {
			name: /\+ Tambah \/ Force Enroll KRS/i,
		});
		fireEvent.click(addBtn);

		const dialog = await screen.findByRole("dialog");

		// Change Academic Year dropdown inside dialog to ay-2
		const modalAySelect = within(dialog).getByLabelText(/2\. TAHUN AJARAN/i);
		fireEvent.change(modalAySelect, { target: { value: "ay-2" } });

		// In ay-2, the pill should be Desain Komunikasi Visual, and Teknik Informatika should NOT appear
		await waitFor(() => {
			expect(
				within(dialog).getByRole("button", {
					name: /Desain Komunikasi Visual/i,
				}),
			).toBeTruthy();
			expect(
				within(dialog).queryByRole("button", {
					name: /Teknik Informatika/i,
				}),
			).toBeNull();
		});
	});
});
