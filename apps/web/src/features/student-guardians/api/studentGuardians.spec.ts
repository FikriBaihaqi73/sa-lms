import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { getStudentOptionsApi } from "./studentGuardians";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

describe("getStudentOptionsApi", () => {
	beforeEach(() => vi.resetAllMocks());

	it("reads the student array and pagination from the backend response", async () => {
		const students = [{ id: "student-1", studentNumber: "123" }];
		vi.mocked(apiFetch).mockResolvedValue({
			data: students,
			meta: { currentPage: 2, perPage: 20, totalData: 25, totalPages: 2 },
		});

		await expect(
			getStudentOptionsApi({ page: 2, limit: 20, search: " Ada " }),
		).resolves.toEqual({
			data: students,
			meta: { page: 2, limit: 20, total: 25, totalPages: 2 },
		});
		expect(apiFetch).toHaveBeenCalledWith(
			"/student-guardians/options/students?page=2&limit=20&search=Ada",
		);
	});

	it("propagates API errors instead of displaying an empty result", async () => {
		const error = new Error("Request failed");
		vi.mocked(apiFetch).mockRejectedValue(error);
		await expect(getStudentOptionsApi({ page: 1, limit: 20 })).rejects.toBe(
			error,
		);
	});
});
