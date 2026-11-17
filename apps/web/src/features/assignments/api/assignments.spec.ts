import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import {
	createAssignmentApi,
	deleteAssignmentApi,
	getAcademicYearsOptionsApi,
	getAssignmentByIdApi,
	getAssignmentSubmissionsApi,
	getAssignmentsApi,
	getAssignmentTypesOptionsApi,
	getClassesOptionsApi,
	getClassStudentsOptionsApi,
	getModulesOptionsApi,
	updateAssignmentApi,
} from "./assignments";

vi.mock("@/lib/api", () => ({
	apiFetch: vi.fn(),
}));

describe("assignments API client", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("fetches assignments with query parameters", async () => {
		const mockData = [
			{
				id: "asg-1",
				module_id: "mod-1",
				assignment_type_id: "type-1",
				title: "Tugas REST API",
				max_score: 100,
			},
		];

		vi.mocked(apiFetch).mockResolvedValueOnce({
			data: mockData,
			meta: {
				totalData: 1,
				totalPages: 1,
				currentPage: 1,
				perPage: 10,
			},
		});

		const result = await getAssignmentsApi({
			page: 1,
			limit: 10,
			search: "REST",
		});
		expect(apiFetch).toHaveBeenCalledWith(
			"/assignments?page=1&limit=10&search=REST",
		);
		expect(result.data).toEqual(mockData);
		expect(result.meta.totalData).toBe(1);
	});

	it("fetches assignment by id", async () => {
		const mockDetail = {
			id: "asg-1",
			title: "Tugas REST API",
		};
		vi.mocked(apiFetch).mockResolvedValueOnce({ data: mockDetail });

		const result = await getAssignmentByIdApi("asg-1");
		expect(apiFetch).toHaveBeenCalledWith("/assignments/asg-1");
		expect(result).toEqual(mockDetail);
	});

	it("creates an assignment", async () => {
		const payload = {
			module_id: "mod-1",
			assignment_type_id: "type-1",
			title: "Tugas Baru",
			due_date: "2026-11-20T23:59:00.000Z",
			max_score: 100,
		};
		vi.mocked(apiFetch).mockResolvedValueOnce({
			data: { id: "asg-new", ...payload },
		});

		const result = await createAssignmentApi(payload);
		expect(apiFetch).toHaveBeenCalledWith("/assignments", {
			method: "POST",
			body: JSON.stringify(payload),
		});
		expect(result.id).toBe("asg-new");
	});

	it("updates an assignment", async () => {
		const payload = {
			title: "Tugas Diperbarui",
			max_score: 95,
		};
		vi.mocked(apiFetch).mockResolvedValueOnce({
			data: { id: "asg-1", ...payload },
		});

		const result = await updateAssignmentApi("asg-1", payload);
		expect(apiFetch).toHaveBeenCalledWith("/assignments/asg-1", {
			method: "PATCH",
			body: JSON.stringify(payload),
		});
		expect(result.title).toBe("Tugas Diperbarui");
	});

	it("deletes an assignment", async () => {
		vi.mocked(apiFetch).mockResolvedValueOnce({
			data: { success: true, id: "asg-1" },
		});

		const result = await deleteAssignmentApi("asg-1");
		expect(apiFetch).toHaveBeenCalledWith("/assignments/asg-1", {
			method: "DELETE",
		});
		expect(result.success).toBe(true);
	});

	it("fetches assignment submissions", async () => {
		const mockSubmissions = [
			{ id: "sub-1", assignmentId: "asg-1", studentId: "stu-1" },
			{ id: "sub-2", assignmentId: "asg-2", studentId: "stu-2" },
		];
		vi.mocked(apiFetch).mockResolvedValueOnce({
			data: mockSubmissions,
		});

		const result = await getAssignmentSubmissionsApi({ assignmentId: "asg-1" });
		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("sub-1");
	});

	it("fetches options for assignment types, modules, classes, and academic years", async () => {
		vi.mocked(apiFetch)
			.mockResolvedValueOnce({ data: [{ id: "type-1", name: "Proyek" }] })
			.mockResolvedValueOnce({ data: [{ id: "mod-1", title: "Modul 1" }] })
			.mockResolvedValueOnce({ data: [{ id: "cls-1", name: "Informatika A" }] })
			.mockResolvedValueOnce({
				data: [{ id: "ay-1", academic_year: "2026/2028", is_active: true }],
			})
			.mockResolvedValueOnce({
				data: [
					{
						id: "cs-1",
						student: {
							id: "stu-1",
							studentNumber: "1001",
							profile: { fullName: "Alex Pratama" },
						},
						class: { name: "Informatika A" },
					},
				],
			});

		const types = await getAssignmentTypesOptionsApi();
		const modules = await getModulesOptionsApi();
		const classes = await getClassesOptionsApi();
		const ays = await getAcademicYearsOptionsApi();
		const students = await getClassStudentsOptionsApi("cls-1");

		expect(types).toHaveLength(1);
		expect(modules).toHaveLength(1);
		expect(classes).toHaveLength(1);
		expect(ays).toHaveLength(1);
		expect(students).toHaveLength(1);
		expect(students[0]?.fullName).toBe("Alex Pratama");
	});
});
