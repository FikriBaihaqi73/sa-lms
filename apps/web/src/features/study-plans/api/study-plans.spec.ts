import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import {
	createStudyPlanApi,
	deleteStudyPlanApi,
	getAcademicYearsOptionsApi,
	getClassSubjectsOptionsApi,
	getDepartmentsOptionsApi,
	getStudentsOptionsApi,
	getStudyPlanByIdApi,
	getStudyPlansApi,
	updateStudyPlanApi,
} from "./index";

vi.mock("@/lib/api", () => ({
	apiFetch: vi.fn(),
}));

describe("study-plans API client", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("getStudyPlansApi", () => {
		it("fetches study plans with query parameters correctly", async () => {
			const mockData = [
				{
					id: "sp-1",
					student_id: "stu-1",
					class_subject_id: "cs-1",
					academic_year_id: "ay-1",
					created_at: "2026-11-11T00:00:00.000Z",
					updated_at: "2026-11-11T00:00:00.000Z",
				},
			];

			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: mockData,
				meta: {
					currentPage: 1,
					perPage: 10,
					totalData: 1,
					totalPages: 1,
				},
			});

			const result = await getStudyPlansApi({
				page: 1,
				limit: 10,
				search: "Ahmad",
				academic_year_id: "ay-1",
				department_id: "dept-1",
			});

			expect(apiFetch).toHaveBeenCalledWith(
				expect.stringContaining(
					"page=1&limit=10&search=Ahmad&academic_year_id=ay-1&department_id=dept-1",
				),
			);
			expect(result.data).toHaveLength(1);
			expect(result.meta.totalData).toBe(1);
		});
	});

	describe("CRUD operations", () => {
		it("fetches study plan by id", async () => {
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: { id: "sp-1", student_id: "stu-1" },
			});

			const res = await getStudyPlanByIdApi("sp-1");
			expect(apiFetch).toHaveBeenCalledWith("/study-plans/sp-1");
			expect(res.id).toBe("sp-1");
		});

		it("creates a new study plan", async () => {
			const input = {
				student_id: "stu-1",
				class_subject_id: "cs-1",
				academic_year_id: "ay-1",
			};
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: { id: "sp-new", ...input },
			});

			const res = await createStudyPlanApi(input);
			expect(apiFetch).toHaveBeenCalledWith("/study-plans", {
				method: "POST",
				body: JSON.stringify(input),
			});
			expect(res.id).toBe("sp-new");
		});

		it("updates a study plan", async () => {
			const input = { class_subject_id: "cs-2" };
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: { id: "sp-1", ...input },
			});

			const res = await updateStudyPlanApi("sp-1", input);
			expect(apiFetch).toHaveBeenCalledWith("/study-plans/sp-1", {
				method: "PATCH",
				body: JSON.stringify(input),
			});
			expect(res.class_subject_id).toBe("cs-2");
		});

		it("deletes a study plan", async () => {
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: { success: true, id: "sp-1" },
			});

			const res = await deleteStudyPlanApi("sp-1");
			expect(apiFetch).toHaveBeenCalledWith("/study-plans/sp-1", {
				method: "DELETE",
			});
			expect(res.success).toBe(true);
		});
	});

	describe("Options APIs", () => {
		it("fetches academic years options", async () => {
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: [
					{ id: "ay-1", academic_year: "2026/2027", is_active: true },
					{ id: "ay-2", academic_year: "2025/2026", is_active: false },
				],
			});

			const res = await getAcademicYearsOptionsApi();
			expect(res).toHaveLength(2);
			expect(res[0]?.label).toContain("2026/2027 (Aktif)");
			expect(res[1]?.label).toContain("2025/2026 (Tidak Aktif)");
		});

		it("fetches departments options", async () => {
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: [{ id: "d-1", name: "Informatika", code: "INF" }],
			});

			const res = await getDepartmentsOptionsApi();
			expect(res).toHaveLength(1);
			expect(res[0]?.code).toBe("INF");
		});

		it("fetches class subjects options with credits and label", async () => {
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: [
					{
						id: "cs-1",
						class: { name: "X-A" },
						subject: {
							name: "Algoritma",
							code: "ALG-101",
							credits: 3,
							department: { id: "d-1", name: "Informatika" },
						},
						teacher: { profile: { fullName: "Pak Budi" } },
						academic_year: { academic_year: "2026/2027", is_active: true },
					},
				],
			});

			const res = await getClassSubjectsOptionsApi();
			expect(res).toHaveLength(1);
			expect(res[0]?.credits).toBe(3);
			expect(res[0]?.label).toContain(
				"[ALG-101] Algoritma — X-A (Pak Budi) • 3 SKS",
			);
		});

		it("fetches students options", async () => {
			vi.mocked(apiFetch).mockResolvedValueOnce({
				data: [
					{
						id: "st-1",
						studentNumber: "12345",
						profile: { fullName: "Siti Rahma" },
					},
				],
			});

			const res = await getStudentsOptionsApi();
			expect(res).toHaveLength(1);
			expect(res[0]?.fullName).toBe("Siti Rahma");
		});
	});
});
