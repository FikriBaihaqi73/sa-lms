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
	createAssignmentApi,
	deleteAssignmentApi,
	getAcademicYearsOptionsApi,
	getAssignmentSubmissionsApi,
	getAssignmentsApi,
	getAssignmentTypesOptionsApi,
	getClassesOptionsApi,
	getClassStudentsOptionsApi,
	getModulesOptionsApi,
	updateAssignmentApi,
} from "../api/assignments";
import type { AssignmentItem } from "../types";
import { AssignmentsPage } from "./assignments-page";

vi.mock("../api/assignments", () => ({
	getAssignmentsApi: vi.fn(),
	getAssignmentByIdApi: vi.fn(),
	createAssignmentApi: vi.fn(),
	updateAssignmentApi: vi.fn(),
	deleteAssignmentApi: vi.fn(),
	getAssignmentSubmissionsApi: vi.fn(),
	getAssignmentTypesOptionsApi: vi.fn(),
	getModulesOptionsApi: vi.fn(),
	getClassesOptionsApi: vi.fn(),
	getAcademicYearsOptionsApi: vi.fn(),
	getClassStudentsOptionsApi: vi.fn(),
}));

const mockAssignment: AssignmentItem = {
	id: "asg-1",
	created_at: "2026-11-14T00:00:00.000Z",
	updated_at: "2026-11-14T00:00:00.000Z",
	module_id: "mod-1",
	assignment_type_id: "type-1",
	title: "Implementasi Endpoint CRUD Rencana Studi (KRS)",
	description: "Buat endpoint REST API menggunakan Fastify dan TypeBox.",
	due_date: "2026-11-22T23:59:00.000Z",
	max_score: 100,
	assignment_type: {
		id: "type-1",
		name: "Proyek Praktikum",
	},
	module: {
		id: "mod-1",
		title: "Modul 1: Arsitektur REST API & Fastify",
		class_subject: {
			id: "cs-1",
			class_id: "cls-1",
			class: {
				id: "cls-1",
				name: "Kelas Informatika A",
			},
			subject: {
				id: "sub-1",
				name: "Web Developer",
				code: "WD-209",
			},
			teacher: {
				id: "tch-1",
				profile: {
					fullName: "Opung, M.Kom.",
				},
				teacher_number: "T001",
			},
		},
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
			<AssignmentsPage />
		</QueryClientProvider>,
	);
}

describe("AssignmentsPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		vi.mocked(getAssignmentsApi).mockResolvedValue({
			data: [mockAssignment],
			meta: {
				totalData: 1,
				totalPages: 1,
				currentPage: 1,
				perPage: 10,
			},
		});

		vi.mocked(getAcademicYearsOptionsApi).mockResolvedValue([
			{
				id: "ay-1",
				academic_year: "2026/2028",
				is_active: true,
				label: "2026/2028 (Aktif)",
			},
		]);

		vi.mocked(getClassesOptionsApi).mockResolvedValue([
			{
				id: "cls-1",
				name: "Kelas Informatika A",
				departmentName: "Informatika",
			},
		]);

		vi.mocked(getModulesOptionsApi).mockResolvedValue([
			{
				id: "mod-1",
				title: "Modul 1: Arsitektur REST API & Fastify",
				class_subject_id: "cs-1",
				class_subject: {
					id: "cs-1",
					class_id: "cls-1",
				},
			},
		]);

		vi.mocked(getAssignmentTypesOptionsApi).mockResolvedValue([
			{
				id: "type-1",
				name: "Proyek Praktikum",
			},
		]);

		vi.mocked(getClassStudentsOptionsApi).mockResolvedValue([
			{
				id: "cst-1",
				studentId: "stu-1",
				fullName: "Alex Pratama",
				studentNumber: "STU-1001",
				email: "alex@gmail.com",
				className: "Kelas Informatika A",
			},
			{
				id: "cst-2",
				studentId: "stu-2",
				fullName: "Surya Wijaya",
				studentNumber: "STU-2002",
				email: "surya@gmail.com",
				className: "Kelas Informatika A",
			},
		]);

		vi.mocked(getAssignmentSubmissionsApi).mockResolvedValue([
			{
				id: "sub-1",
				createdAt: "2026-11-15T00:00:00.000Z",
				updatedAt: "2026-11-15T00:00:00.000Z",
				assignmentId: "asg-1",
				studentId: "stu-1",
				submittedAt: "2026-11-15T10:00:00.000Z",
				score: 96,
				feedback: "Kerja bagus, arsitektur rapi.",
				fileName: "fastify-krs-alex.zip",
				status: "graded",
			},
		]);
	});

	afterEach(cleanup);

	it("renders header, 4 stats cards, filter bar, assignment cards, and submissions audit table", async () => {
		renderPage();

		// Header
		expect(
			screen.getByText("DATA AKADEMIK • MONITORING & AUDIT PENUGASAN"),
		).toBeTruthy();
		expect(
			screen.getByText("Monitoring Tugas & Submisi (Assignments)"),
		).toBeTruthy();
		expect(screen.getByText("Ekspor Rekap Kelas")).toBeTruthy();
		expect(screen.getByText("Tambah Tugas")).toBeTruthy();

		// 4 Stat Cards
		expect(await screen.findByText("TUGAS TERBIT DI KELAS")).toBeTruthy();
		expect(screen.getByText("SISWA MENGUMPULKAN")).toBeTruthy();
		expect(screen.getByText("SUDAH DINILAI GURU")).toBeTruthy();
		expect(screen.getByText("BELUM MENGUMPULKAN")).toBeTruthy();

		// Filter bar
		expect(screen.getByLabelText(/1\. TAHUN AJARAN/i)).toBeTruthy();
		expect(screen.getByLabelText(/2\. PILIH KELAS/i)).toBeTruthy();
		expect(screen.getByLabelText(/3\. FILTER MODUL/i)).toBeTruthy();

		// Assignment card
		expect(
			(
				await screen.findAllByText(
					"Implementasi Endpoint CRUD Rencana Studi (KRS)",
				)
			).length,
		).toBeGreaterThan(0);
		expect(screen.getByText("Proyek Praktikum")).toBeTruthy();
		expect(screen.getByText("WD-209")).toBeTruthy();

		// Submissions table
		expect(await screen.findByText("Alex Pratama")).toBeTruthy();
		expect(screen.getByText("Surya Wijaya")).toBeTruthy();
		expect(screen.getByText("Sudah Mengumpulkan")).toBeTruthy();
		expect(screen.getByText("Belum Mengumpulkan")).toBeTruthy();
		expect(screen.getByText("fastify-krs-alex.zip")).toBeTruthy();
		expect(screen.getByText("96 / 100")).toBeTruthy();
	});

	it("opens Add Assignment dialog when clicking 'Tambah Tugas' and creates new assignment", async () => {
		renderPage();

		expect(await screen.findByText("TUGAS TERBIT DI KELAS")).toBeTruthy();

		const addBtn = screen.getByRole("button", { name: /Tambah Tugas/i });
		fireEvent.click(addBtn);

		const dialog = await screen.findByRole("dialog");
		expect(dialog).toBeTruthy();
		expect(
			within(dialog).getByText("INTERVENSI ADMIN (TAMBAH PENUGASAN)"),
		).toBeTruthy();
		expect(within(dialog).getByText("Tambah Penugasan Baru")).toBeTruthy();

		// Fill title
		const titleInput = within(dialog).getByLabelText(/Judul Tugas/i);
		fireEvent.change(titleInput, { target: { value: "Tugas Algoritma Baru" } });

		// Select module & type
		const moduleSelect = within(dialog).getByLabelText(/Modul Pembelajaran/i);
		fireEvent.change(moduleSelect, { target: { value: "mod-1" } });

		const typeSelect = within(dialog).getByLabelText(/Tipe Penugasan/i);
		fireEvent.change(typeSelect, { target: { value: "type-1" } });

		// Fill due date
		const dueDateInput = within(dialog).getByLabelText(/Batas Waktu/i);
		fireEvent.change(dueDateInput, {
			target: { value: "2026-11-25T23:59" },
		});

		// Submit form
		vi.mocked(createAssignmentApi).mockResolvedValueOnce({
			id: "asg-new",
			created_at: "2026-11-17T00:00:00.000Z",
			updated_at: "2026-11-17T00:00:00.000Z",
			module_id: "mod-1",
			assignment_type_id: "type-1",
			title: "Tugas Algoritma Baru",
			max_score: 100,
		});

		const submitBtn = within(dialog).getByRole("button", {
			name: /Simpan Tugas/i,
		});
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(createAssignmentApi).toHaveBeenCalled();
		});
	});

	it("opens Edit Assignment dialog when clicking the pencil icon in assignment card", async () => {
		renderPage();

		expect(await screen.findByText("TUGAS TERBIT DI KELAS")).toBeTruthy();
		expect(
			(
				await screen.findAllByText(
					"Implementasi Endpoint CRUD Rencana Studi (KRS)",
				)
			).length,
		).toBeGreaterThan(0);

		const editBtn = screen.getByLabelText(
			/Ubah penugasan Implementasi Endpoint CRUD Rencana Studi \(KRS\)/i,
		);
		expect(editBtn).toBeTruthy();
		fireEvent.click(editBtn);

		const dialog = await screen.findByRole("dialog");
		expect(
			within(dialog).getByText("INTERVENSI ADMIN (UBAH PENUGASAN)"),
		).toBeTruthy();
		expect(within(dialog).getByText("Ubah Penugasan")).toBeTruthy();

		// Change score
		const maxScoreInput = within(dialog).getByLabelText(/Skor Maksimal/i);
		fireEvent.change(maxScoreInput, { target: { value: "90" } });

		vi.mocked(updateAssignmentApi).mockResolvedValueOnce({
			...mockAssignment,
			max_score: 90,
		});

		const saveBtn = within(dialog).getByRole("button", {
			name: /Simpan Perubahan/i,
		});
		fireEvent.click(saveBtn);

		await waitFor(() => {
			expect(updateAssignmentApi).toHaveBeenCalled();
		});
	});

	it("opens Delete Assignment confirmation dialog when clicking trash icon in assignment card", async () => {
		renderPage();

		expect(
			await screen.findByText("Implementasi Endpoint CRUD Rencana Studi (KRS)"),
		).toBeTruthy();

		const deleteBtn = screen.getByLabelText(
			/Hapus penugasan Implementasi Endpoint CRUD Rencana Studi \(KRS\)/i,
		);
		expect(deleteBtn).toBeTruthy();
		fireEvent.click(deleteBtn);

		expect(await screen.findByText("Hapus Penugasan Ini?")).toBeTruthy();

		vi.mocked(deleteAssignmentApi).mockResolvedValueOnce({
			success: true,
			id: "asg-1",
		});

		const confirmDeleteBtn = screen.getByRole("button", {
			name: /Ya, Hapus Tugas/i,
		});
		fireEvent.click(confirmDeleteBtn);

		await waitFor(() => {
			expect(deleteAssignmentApi).toHaveBeenCalledWith("asg-1");
		});
	});

	it("opens student submission audit modal when clicking 'Rincian'", async () => {
		renderPage();

		expect(await screen.findByText("Alex Pratama")).toBeTruthy();

		const rincianBtns = screen.getAllByRole("button", { name: /Rincian/i });
		expect(rincianBtns.length).toBeGreaterThan(0);
		const firstRincian = rincianBtns[0];
		if (firstRincian) {
			fireEvent.click(firstRincian);
		}

		expect(await screen.findByText("AUDIT SUBMISI SISWA")).toBeTruthy();
		expect(screen.getByText("Kerja bagus, arsitektur rapi.")).toBeTruthy();
	});

	it("filters student rows when clicking tabs and typing in student search input", async () => {
		renderPage();

		expect(await screen.findByText("Alex Pratama")).toBeTruthy();
		expect(screen.getByText("Surya Wijaya")).toBeTruthy();

		// Click "Belum Kumpul" tab
		const belumKumpulTab = screen.getByRole("button", {
			name: /Belum Kumpul/i,
		});
		fireEvent.click(belumKumpulTab);

		// Alex Pratama has submitted, so should be filtered out
		expect(screen.queryByText("Alex Pratama")).toBeNull();
		// Surya Wijaya has not submitted, so should be visible
		expect(screen.getByText("Surya Wijaya")).toBeTruthy();

		// Click "Sudah Kumpul" tab
		const sudahKumpulTab = screen.getByRole("button", {
			name: /Sudah Kumpul/i,
		});
		fireEvent.click(sudahKumpulTab);

		expect(screen.getByText("Alex Pratama")).toBeTruthy();
		expect(screen.queryByText("Surya Wijaya")).toBeNull();

		// Search input
		const searchInput = screen.getByPlaceholderText(
			"Cari nama siswa, NIS, atau email...",
		);
		fireEvent.change(searchInput, { target: { value: "Budi" } });
		expect(
			screen.getByText(
				"Tidak ada data siswa yang cocok dengan filter atau kata kunci pencarian.",
			),
		).toBeTruthy();
	});
});
