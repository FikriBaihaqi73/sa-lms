// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTeachingJournalById, getTeachingJournals } from "./api";
import { TeachingJournalsPage } from "./components/teaching-journals-page";

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
	},
}));

vi.mock("./api", () => ({
	getTeachingJournals: vi.fn(),
	getJournals: vi.fn(),
	getTeachingJournalById: vi.fn(),
	getJournal: vi.fn(),
	createTeachingJournal: vi.fn(),
	updateTeachingJournal: vi.fn(),
	deleteTeachingJournal: vi.fn(),
}));

vi.mock("./hooks", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./hooks")>();
	return {
		...actual,
		useSchedulesOptions: () => ({
			data: [
				{
					id: "12345678-1234-1234-1234-123456789abc",
					label: "X RPL 1 - Matematika (Budi Santoso, M.Pd)",
					day: "Senin",
					className: "X RPL 1",
					subjectName: "Matematika",
					teacherName: "Budi Santoso, M.Pd",
					roomName: "Lab Komputer",
					timeRange: "07:30 - 09:00",
				},
			],
			isLoading: false,
		}),
	};
});

const mockJournal = {
	id: "j1",
	schedule_id: "12345678-1234-1234-1234-123456789abc",
	meeting_number: 1,
	journal_date: "2026-01-02T00:00:00.000Z",
	topic: "Pengenalan Aljabar",
	material: "Variabel dan Persamaan Linear",
	notes: "Siswa sangat antusias",
	schedule: {
		id: "12345678-1234-1234-1234-123456789abc",
		day: "Senin",
		startTime: "07:30",
		endTime: "09:00",
		classroom: { id: "c1", roomCode: "LAB-01", roomName: "Lab Komputer" },
		classSubject: {
			id: "cs1",
			class: { id: "cls1", name: "X RPL 1" },
			subject: { id: "s1", name: "Matematika", code: "MTK" },
			teacher: {
				id: "t1",
				profile: { id: "p1", fullName: "Budi Santoso, M.Pd" },
			},
		},
	},
	createdBy: {
		id: "u1",
		name: "Budi Santoso",
		email: "budi@school.sch.id",
		profile: { fullName: "Budi Santoso, M.Pd" },
	},
};

const mockListResult = {
	data: [mockJournal],
	meta: {
		currentPage: 1,
		perPage: 10,
		totalData: 1,
		totalPages: 1,
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
			<TeachingJournalsPage />
		</QueryClientProvider>,
	);
}

describe("TeachingJournalsPage Component", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(getTeachingJournals).mockResolvedValue(mockListResult);
		vi.mocked(getTeachingJournalById).mockResolvedValue(mockJournal);
	});

	afterEach(cleanup);

	it("renders page header, 4 metric cards, and table data", async () => {
		renderPage();

		expect(screen.getByText("AKTIVITAS AKADEMIK")).toBeTruthy();
		expect(screen.getByText("Jurnal Mengajar")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Tambah Jurnal" })).toBeTruthy();

		expect(screen.getByText("TOTAL JURNAL")).toBeTruthy();
		expect(screen.getByText("TOTAL PERTEMUAN")).toBeTruthy();
		expect(screen.getByText("GURU MENGISI")).toBeTruthy();
		expect(screen.getByText("JADWAL TERPANTAU")).toBeTruthy();

		expect(await screen.findByText("Pengenalan Aljabar")).toBeTruthy();
		expect(screen.getByText("Matematika")).toBeTruthy();
		expect(screen.getByText("#1")).toBeTruthy();
		expect(screen.getByText("Ada catatan")).toBeTruthy();
	});

	it("opens create dialog when clicking 'Tambah Jurnal'", async () => {
		renderPage();

		const addBtn = screen.getByRole("button", { name: "Tambah Jurnal" });
		fireEvent.click(addBtn);

		expect(await screen.findByText("Tambah Jurnal Mengajar")).toBeTruthy();
		expect(screen.getByText("Jadwal Pelajaran")).toBeTruthy();
		expect(
			screen.getByPlaceholderText(/Contoh: Pengenalan Aljabar/i),
		).toBeTruthy();
	});

	it("opens detail dialog when clicking 'Detail'", async () => {
		renderPage();

		await screen.findByText("Pengenalan Aljabar");
		const detailBtn = screen.getByRole("button", { name: "Detail" });
		fireEvent.click(detailBtn);

		expect(await screen.findByText("Rincian Materi Ajar")).toBeTruthy();
		expect(
			screen.getAllByText("Variabel dan Persamaan Linear").length,
		).toBeGreaterThan(0);
		expect(screen.getByText("Siswa sangat antusias")).toBeTruthy();
	});

	it("opens edit dialog when clicking 'Ubah'", async () => {
		renderPage();

		await screen.findByText("Pengenalan Aljabar");
		const editBtn = screen.getByRole("button", { name: "Ubah" });
		fireEvent.click(editBtn);

		expect(await screen.findByText("Ubah Jurnal Mengajar")).toBeTruthy();
		const topicInput = screen.getByDisplayValue("Pengenalan Aljabar");
		expect(topicInput).toBeTruthy();
	});

	it("opens delete dialog when clicking 'Hapus'", async () => {
		renderPage();

		await screen.findByText("Pengenalan Aljabar");
		const deleteBtn = screen.getByRole("button", { name: "Hapus" });
		fireEvent.click(deleteBtn);

		expect(await screen.findByText("Hapus Jurnal Mengajar?")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Ya, Hapus Jurnal" }),
		).toBeTruthy();
	});

	it("shows empty state when no journals are returned", async () => {
		vi.mocked(getTeachingJournals).mockResolvedValue({
			data: [],
			meta: { currentPage: 1, perPage: 10, totalData: 0, totalPages: 0 },
		});

		renderPage();

		expect(
			await screen.findByText("Belum ada catatan jurnal mengajar"),
		).toBeTruthy();
	});

	it("shows error alert and provides retry button when loading fails", async () => {
		vi.mocked(getTeachingJournals)
			.mockRejectedValueOnce(new Error("Network Error"))
			.mockResolvedValueOnce(mockListResult);

		renderPage();

		expect(
			await screen.findByText("Gagal memuat daftar jurnal mengajar"),
		).toBeTruthy();

		const retryBtn = screen.getByRole("button", { name: "Coba Lagi" });
		fireEvent.click(retryBtn);

		expect(await screen.findByText("Pengenalan Aljabar")).toBeTruthy();
	});
});
