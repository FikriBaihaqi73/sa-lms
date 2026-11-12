// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "./api/users";
import { UsersPage } from "./components/UsersPage";

vi.mock("@/features/auth/hooks/useAuth", () => ({
	useAuth: () => ({ user: { id: "admin-1", role: "admin" } }),
}));

vi.mock("@/hooks/useDebounce", () => ({
	useDebounce: (val: string) => val,
}));

const mockActiveUser = {
	id: "user-1",
	email: "guru.aktif@sekolah.sch.id",
	is_active: true,
	last_login: "2026-11-01T08:00:00.000Z",
	profile: [
		{
			id: "prof-1",
			fullName: "Guru Aktif, S.Pd",
			institution: { id: "inst-1", name: "SMK Test", shortName: "SMKT" },
			role: { id: "role-1", name: "Teacher" },
		},
	],
};

const mockDeletedUser = {
	id: "user-2",
	email: "guru.terhapus@sekolah.sch.id",
	is_active: false,
	last_login: null,
	deleted_at: "2026-11-09T08:00:00.000Z",
	profile: [
		{
			id: "prof-2",
			fullName: "Guru Terhapus, M.Pd",
			institution: { id: "inst-1", name: "SMK Test", shortName: "SMKT" },
			role: { id: "role-1", name: "Teacher" },
		},
	],
};

describe("UsersPage Component", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		vi.spyOn(api, "getUsersApi").mockImplementation(async (params) => {
			if (params.status === "deleted") {
				return {
					data: [mockDeletedUser],
					meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
				};
			}
			return {
				data: [mockActiveUser],
				meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
			};
		});
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	const renderComponent = () =>
		render(
			<QueryClientProvider client={queryClient}>
				<UsersPage />
			</QueryClientProvider>,
		);

	it("renders active users by default and shows active status", async () => {
		renderComponent();

		expect(await screen.findByText("Guru Aktif, S.Pd")).toBeTruthy();
		expect(screen.getByText("guru.aktif@sekolah.sch.id")).toBeTruthy();
		expect(screen.getByText("Aktif")).toBeTruthy();
		expect(screen.getByText("Data Dihapus")).toBeTruthy();
	});

	it("switches to deleted users view and displays deleted user with 'Dihapus' badge and 'Terhapus' action", async () => {
		renderComponent();

		expect(await screen.findByText("Guru Aktif, S.Pd")).toBeTruthy();

		// Click "Data Dihapus" tab
		const deletedTab = screen.getByRole("button", { name: /Data Dihapus/i });
		fireEvent.click(deletedTab);

		expect(await screen.findByText("Guru Terhapus, M.Pd")).toBeTruthy();
		expect(screen.getByText("guru.terhapus@sekolah.sch.id")).toBeTruthy();
		expect(screen.getByText("Dihapus")).toBeTruthy();
		expect(screen.getByText("Terhapus")).toBeTruthy();

		// Edit and Delete buttons should not be present in deleted view
		expect(screen.queryByTitle("Ubah Pengguna")).toBeNull();
		expect(screen.queryByTitle("Hapus Pengguna")).toBeNull();
	});
});
