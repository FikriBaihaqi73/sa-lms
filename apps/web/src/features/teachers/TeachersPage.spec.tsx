// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "./api/teachers";
import { TeachersPage } from "./components/TeachersPageView";

vi.mock("@/features/auth/hooks/useAuth", () => ({
	useAuth: () => ({ user: { id: "admin-1", role: "admin" } }),
}));

vi.mock("@/hooks/useDebounce", () => ({
	useDebounce: (val: string) => val,
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

const mockTeacher = {
	id: "teacher-1",
	profile_id: "profile-1",
	teacher_number: "198501012010011001",
	department_id: "dept-1",
	specialization_id: "spec-1",
	employment_status_id: "status-1",
	join_date: "2024-01-15T00:00:00.000Z",
	created_at: "2024-01-15T00:00:00.000Z",
	updated_at: "2024-01-15T00:00:00.000Z",
	profile: {
		id: "profile-1",
		fullName: "Dra. Siti Rahmawati, M.Pd",
		email: "siti.rahmawati@sekolah.sch.id",
		phoneNumber: "081234567890",
		gender: "Perempuan",
		userId: "user-1",
		users: {
			id: "user-1",
			email: "siti.rahmawati@sekolah.sch.id",
			is_active: true,
		},
	},
	department: {
		id: "dept-1",
		name: "MIPA",
		code: "MIP",
	},
	specialization: {
		id: "spec-1",
		name: "Matematika",
	},
	employment_status: {
		id: "status-1",
		name: "Tetap",
	},
	_count: {
		classSubjects: 3,
		classes: 1,
	},
};

const mockStats = {
	total: 1,
	tetapCount: 1,
	honorerCount: 0,
	specializationCount: 1,
	totalClassAssignments: 3,
	unassignedCount: 0,
};

describe("TeachersPage Component", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});

		vi.spyOn(api, "getTeachersApi").mockResolvedValue({
			data: [mockTeacher],
			meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
		});

		vi.spyOn(api, "getTeacherStatsApi").mockResolvedValue(mockStats);
		vi.spyOn(api, "getEmploymentStatusesApi").mockResolvedValue([
			{ id: "status-1", name: "Tetap" },
		]);
		vi.spyOn(api, "getSpecializationsApi").mockResolvedValue([
			{ id: "spec-1", name: "Matematika" },
		]);
		vi.spyOn(api, "getDepartmentsApi").mockResolvedValue([
			{ id: "dept-1", name: "MIPA", code: "MIP" },
		]);
		vi.spyOn(api, "createTeacherApi").mockResolvedValue(mockTeacher);
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	const renderComponent = () =>
		render(
			<QueryClientProvider client={queryClient}>
				<TeachersPage />
			</QueryClientProvider>,
		);

	it("renders header, 4 metric cards, and teacher table data", async () => {
		renderComponent();

		// 1. Header
		expect(await screen.findByText("Guru / Teacher")).toBeTruthy();
		expect(screen.getByText("Master Registry")).toBeTruthy();

		// 2. 4 Metric Cards
		expect(screen.getByText("Total Guru")).toBeTruthy();
		expect(screen.getByText("Spesialisasi")).toBeTruthy();
		expect(screen.getByText("Kelas Diampu")).toBeTruthy();
		expect(screen.getByText("Belum ada kelas")).toBeTruthy();

		// 3. Table Data
		expect(await screen.findByText("Dra. Siti Rahmawati, M.Pd")).toBeTruthy();
		expect(screen.getByText("198501012010011001")).toBeTruthy();
		expect(screen.getAllByText(/MIPA/).length).toBeGreaterThan(0);
		expect(screen.getAllByText("Matematika").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Tetap").length).toBeGreaterThan(0);
	});

	it("opens 1-step onboarding create dialog when clicking 'Tambah guru'", async () => {
		renderComponent();

		const addBtn = await screen.findByRole("button", {
			name: /Tambah guru/i,
		});
		fireEvent.click(addBtn);

		expect(await screen.findByText("Tambah Guru Baru")).toBeTruthy();
		expect(screen.getByText(/Bagian 1 — Akun Login & Identitas/i)).toBeTruthy();
		expect(screen.getByText(/Bagian 2 — Data Kepegawaian/i)).toBeTruthy();

		// Verify "Pilih profil guru" is NOT present
		expect(screen.queryByText(/Pilih profil guru/i)).toBeNull();

		// Verify form fields
		expect(screen.getByLabelText(/Nama Lengkap Guru/i)).toBeTruthy();
		expect(screen.getByLabelText(/Email Login/i)).toBeTruthy();
		expect(screen.getByLabelText(/Password Awal/i)).toBeTruthy();
		expect(screen.getByLabelText(/NIP \/ No\. Guru/i)).toBeTruthy();
	});

	it("opens edit dialog with prefilled values when clicking edit button", async () => {
		renderComponent();

		const editBtn = await screen.findByRole("button", {
			name: /Ubah guru Dra\. Siti Rahmawati/i,
		});
		fireEvent.click(editBtn);

		expect(await screen.findByText("Edit Data Guru")).toBeTruthy();

		const nameInput = screen.getByLabelText(
			/Nama Lengkap Guru/i,
		) as HTMLInputElement;
		expect(nameInput.value).toBe("Dra. Siti Rahmawati, M.Pd");

		const emailInput = screen.getByLabelText(
			/Email Login/i,
		) as HTMLInputElement;
		expect(emailInput.value).toBe("siti.rahmawati@sekolah.sch.id");

		const nipInput = screen.getByLabelText(
			/NIP \/ No\. Guru/i,
		) as HTMLInputElement;
		expect(nipInput.value).toBe("198501012010011001");
	});

	it("opens delete dialog when clicking delete button", async () => {
		renderComponent();

		const deleteBtn = await screen.findByRole("button", {
			name: /Hapus guru Dra\. Siti Rahmawati/i,
		});
		fireEvent.click(deleteBtn);

		expect(
			await screen.findByRole("heading", { name: "Hapus guru" }),
		).toBeTruthy();
		expect(screen.getByRole("button", { name: "Batal" })).toBeTruthy();
		expect(screen.getAllByText(/198501012010011001/).length).toBeGreaterThan(0);
	});

	it("shows floating pop-up card at top-right when creating a teacher and can dismiss it manually", async () => {
		renderComponent();

		const addBtn = await screen.findByRole("button", {
			name: /Tambah guru/i,
		});
		fireEvent.click(addBtn);

		expect(await screen.findByText("Tambah Guru Baru")).toBeTruthy();

		fireEvent.change(screen.getByLabelText(/Nama Lengkap Guru/i), {
			target: { value: "Ahmad Dahlan, M.Pd" },
		});
		fireEvent.change(screen.getByLabelText(/Email Login/i), {
			target: { value: "ahmad.dahlan@sekolah.sch.id" },
		});
		fireEvent.change(screen.getByLabelText(/Password Awal/i), {
			target: { value: "Password123#" },
		});
		fireEvent.change(screen.getByLabelText(/NIP \/ No\. Guru/i), {
			target: { value: "198801012015011002" },
		});

		fireEvent.click(
			screen.getByRole("button", { name: /Simpan & Buat Akun/i }),
		);

		const popup = await screen.findByRole("status");
		expect(popup).toBeTruthy();
		expect(popup.className).toContain("fixed");
		expect(popup.className).toContain("top-20");
		expect(popup.className).toContain("right-6");
		expect(
			screen.getByText("Akun login dan data guru berhasil dibuat."),
		).toBeTruthy();

		const closeNoticeBtn = screen.getByRole("button", {
			name: /Tutup notifikasi/i,
		});
		fireEvent.click(closeNoticeBtn);
		expect(
			screen.queryByText("Akun login dan data guru berhasil dibuat."),
		).toBeNull();
	});

	it("renders pagination inside table with per page selector and page navigation", async () => {
		renderComponent();

		expect(await screen.findByText(/Menampilkan/)).toBeTruthy();
		expect(screen.getByText(/dari/)).toBeTruthy();
		expect(screen.getByText("Per halaman:")).toBeTruthy();

		const prevBtn = screen.getByRole("button", {
			name: /Halaman Sebelumnya/i,
		});
		expect(prevBtn).toBeTruthy();
		expect((prevBtn as HTMLButtonElement).disabled).toBe(true);

		const nextBtn = screen.getByRole("button", {
			name: /Halaman Berikutnya/i,
		});
		expect(nextBtn).toBeTruthy();
		expect((nextBtn as HTMLButtonElement).disabled).toBe(true);

		const limitSelect = screen.getByRole("combobox", {
			name: /Jumlah per halaman/i,
		});
		expect(limitSelect).toBeTruthy();
		fireEvent.change(limitSelect, { target: { value: "25" } });
	});
});
