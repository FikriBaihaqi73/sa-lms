import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { ModulesPage } from "./modules-page";

vi.mock("@/lib/api", () => ({
	apiFetch: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		fieldErrors: Array<{ field: string; message: string }>;
		constructor(
			message: string,
			status = 500,
			fieldErrors: Array<{ field: string; message: string }> = [],
		) {
			super(message);
			this.status = status;
			this.fieldErrors = fieldErrors;
		}
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const mockModulesList = {
	status: "success",
	message: "OK",
	code: 200,
	data: [
		{
			id: "mod-1",
			class_subject_id: "cs-1",
			title: "Bab 1: Logika Komputasi",
			description: "Konsep dasar algoritma",
			display_order: 1,
			is_published: true,
			is_locked: false,
			class_subject: {
				id: "cs-1",
				class: { id: "c-1", name: "X-RPL-1" },
				subject: { id: "s-1", name: "Informatika", code: "INF-10" },
				teacher: {
					id: "t-1",
					teacher_number: "T101",
					profile: { id: "p-1", fullName: "Budi Santoso" },
				},
			},
			moduleContents: [{ id: "mc-1", title: "Slide 1" }],
			assignments: [],
		},
	],
	meta: {
		totalData: 1,
		totalPages: 1,
		currentPage: 1,
		perPage: 10,
	},
};

const mockClassSubjectsResponse = {
	data: [
		{
			id: "cs-1",
			class: { name: "X-RPL-1" },
			subject: { name: "Informatika", code: "INF-10" },
			teacher: {
				teacher_number: "T101",
				profile: { fullName: "Budi Santoso" },
			},
			academic_year: { academic_year: "2026/2027" },
		},
	],
};

function renderWithQueryClient(ui: React.ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
}

describe("ModulesPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(apiFetch).mockImplementation(async (url: string) => {
			if (url.startsWith("/class-subjects")) {
				return mockClassSubjectsResponse;
			}
			if (url.startsWith("/modules")) {
				return mockModulesList;
			}
			return { data: [] };
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders module list and stats cards properly", async () => {
		renderWithQueryClient(<ModulesPage />);

		expect(screen.getByText("Modul Pembelajaran")).toBeTruthy();
		await waitFor(() => {
			expect(screen.getByText("Bab 1: Logika Komputasi")).toBeTruthy();
		});

		expect(screen.getByText("TOTAL MODUL")).toBeTruthy();
		expect(screen.getByText("DITERBITKAN")).toBeTruthy();
		expect(screen.getByText("TERKUNCI")).toBeTruthy();
	});

	it("opens create module dialog and submits new module", async () => {
		renderWithQueryClient(<ModulesPage />);

		await waitFor(() => {
			expect(screen.getByText("Bab 1: Logika Komputasi")).toBeTruthy();
		});

		const addButton = screen.getByRole("button", { name: /Tambah Modul/i });
		fireEvent.click(addButton);

		expect(
			screen.getByText("Tambah Modul Pembelajaran"),
		).toBeTruthy();

		// Fill Title
		const titleInput = screen.getByPlaceholderText(
			/Contoh: Bab 1 - Pengenalan Algoritma/i,
		);
		fireEvent.change(titleInput, { target: { value: "Bab 2: Pemrograman Web" } });

		// Click submit button in dialog
		const submitButton = screen.getByRole("button", {
			name: "Tambah Modul",
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(apiFetch).toHaveBeenCalledWith(
				"/modules",
				expect.objectContaining({
					method: "POST",
					body: expect.stringContaining("Bab 2: Pemrograman Web"),
				}),
			);
		});
	});

	it("opens detail dialog when clicking detail button", async () => {
		renderWithQueryClient(<ModulesPage />);

		await waitFor(() => {
			expect(screen.getByText("Bab 1: Logika Komputasi")).toBeTruthy();
		});

		const detailButton = screen.getByRole("button", { name: "Detail" });
		fireEvent.click(detailButton);

		await waitFor(() => {
			expect(
				screen.getByText("Rincian informasi silabus, materi pembelajaran, dan status akses modul."),
			).toBeTruthy();
			expect(screen.getAllByText("Konsep dasar algoritma").length).toBeGreaterThan(0);
		});
	});

	it("opens delete dialog when clicking delete button and confirms delete", async () => {
		renderWithQueryClient(<ModulesPage />);

		await waitFor(() => {
			expect(screen.getByText("Bab 1: Logika Komputasi")).toBeTruthy();
		});

		const deleteButton = screen.getByRole("button", { name: "Hapus" });
		fireEvent.click(deleteButton);

		await waitFor(() => {
			expect(
				screen.getByText("Hapus Modul Pembelajaran?"),
			).toBeTruthy();
		});

		const confirmDeleteBtn = screen.getByRole("button", {
			name: "Ya, Hapus Modul",
		});
		fireEvent.click(confirmDeleteBtn);

		await waitFor(() => {
			expect(apiFetch).toHaveBeenCalledWith(
				"/modules/mod-1",
				expect.objectContaining({ method: "DELETE" }),
			);
		});
	});

	it("filters modules using search input", async () => {
		renderWithQueryClient(<ModulesPage />);

		const searchInput = screen.getByPlaceholderText(
			"Cari judul modul atau deskripsi pembelajaran...",
		);
		fireEvent.change(searchInput, { target: { value: "Algoritma" } });

		await waitFor(() => {
			expect(apiFetch).toHaveBeenCalledWith(
				expect.stringContaining("search=Algoritma"),
			);
		});
	});
});
