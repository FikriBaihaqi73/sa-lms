import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { StudentsPage } from "./StudentsPage";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));
vi.mock("./StudentDialog", () => ({
	StudentDialog: ({
		open,
		onSave,
	}: {
		open: boolean;
		onSave: (value: {
			profileId: string;
			academicStatusId: string;
			studentNumber: string;
			referralCode: string;
			referralExpiresAt: string;
		}) => Promise<void>;
	}) =>
		open ? (
			<div role="dialog">
				<button
					type="button"
					onClick={() =>
						void onSave({
							profileId: "profile-1",
							academicStatusId: "status-1",
							studentNumber: "123",
							referralCode: "",
							referralExpiresAt: "",
						})
					}
				>
					Kirim
				</button>
			</div>
		) : null,
}));

describe("StudentsPage mutation errors", () => {
	afterEach(() => {
		cleanup();
		vi.resetAllMocks();
	});
	it.each([
		"POST",
		"PATCH",
	])("shows %s error and retains the list and dialog", async (method) => {
		vi.mocked(apiFetch).mockImplementation(
			async (endpoint: string, options?: RequestInit) => {
				if (options?.method === method) throw new Error("Validasi siswa gagal");
				if (endpoint.startsWith("/students?"))
					return {
						data: {
							data: [
								{
									id: "s1",
									studentNumber: "123",
									academicStatusId: "status-1",
									profile: { id: "profile-1", fullName: "Alice" },
								},
							],
							meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
						},
					};
				return { data: [] };
			},
		);
		const client = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		render(
			<QueryClientProvider client={client}>
				<StudentsPage />
			</QueryClientProvider>,
		);
		await screen.findByText("Alice");
		fireEvent.click(
			method === "POST"
				? screen.getByRole("button", { name: /Tambah Siswa/i })
				: screen.getByRole("button", { name: "Ubah" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Kirim" }));
		await waitFor(() =>
			expect(screen.getByText("Validasi siswa gagal")).toBeTruthy(),
		);
		expect(screen.getByRole("dialog")).toBeTruthy();
		expect(screen.getByText("Alice")).toBeTruthy();
		expect(apiFetch).toHaveBeenCalledWith(
			method === "POST" ? "/students" : "/students/s1",
			expect.objectContaining({ method }),
		);
		client.clear();
	});
});
