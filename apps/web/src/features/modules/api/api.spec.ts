import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import {
	createModule,
	deleteModule,
	getClassSubjectOptions,
	getModuleById,
	getModules,
	updateModule,
} from "./index";

vi.mock("@/lib/api", () => ({
	apiFetch: vi.fn(),
}));

describe("modules api", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches module list with query params", async () => {
		const mockResponse = {
			status: "success",
			message: "OK",
			code: 200,
			data: [
				{
					id: "m-1",
					class_subject_id: "cs-1",
					title: "Bab 1: Aljabar",
					description: "Materi dasar",
					display_order: 1,
					is_published: true,
					is_locked: false,
				},
			],
			meta: {
				currentPage: 1,
				perPage: 10,
				totalData: 1,
				totalPages: 1,
			},
		};

		vi.mocked(apiFetch).mockResolvedValue(mockResponse);

		const result = await getModules({
			page: 1,
			limit: 10,
			search: "Aljabar",
			class_subject_id: "cs-1",
		});

		expect(apiFetch).toHaveBeenCalledWith(
			"/modules?page=1&limit=10&search=Aljabar&class_subject_id=cs-1",
		);
		expect(result).toEqual(mockResponse);
	});

	it("fetches module detail by id", async () => {
		const mockModule = {
			id: "m-1",
			class_subject_id: "cs-1",
			title: "Bab 1: Aljabar",
			is_published: true,
		};

		vi.mocked(apiFetch).mockResolvedValue({ data: mockModule });

		const result = await getModuleById("m-1");
		expect(apiFetch).toHaveBeenCalledWith("/modules/m-1");
		expect(result).toEqual(mockModule);
	});

	it("creates a new module", async () => {
		const input = {
			class_subject_id: "cs-1",
			title: "Bab 2: Geometri",
			display_order: 2,
			is_published: false,
			is_locked: false,
		};

		vi.mocked(apiFetch).mockResolvedValue({
			data: { id: "m-2", ...input },
		});

		const result = await createModule(input);
		expect(apiFetch).toHaveBeenCalledWith("/modules", {
			method: "POST",
			body: JSON.stringify(input),
		});
		expect(result).toEqual({ id: "m-2", ...input });
	});

	it("updates a module", async () => {
		const updateInput = {
			title: "Bab 2: Geometri Ruang",
			is_published: true,
		};

		vi.mocked(apiFetch).mockResolvedValue({
			data: { id: "m-2", ...updateInput },
		});

		const result = await updateModule("m-2", updateInput);
		expect(apiFetch).toHaveBeenCalledWith("/modules/m-2", {
			method: "PATCH",
			body: JSON.stringify(updateInput),
		});
		expect(result).toEqual({ id: "m-2", ...updateInput });
	});

	it("deletes a module", async () => {
		vi.mocked(apiFetch).mockResolvedValue({
			data: { success: true, id: "m-2" },
		});

		const result = await deleteModule("m-2");
		expect(apiFetch).toHaveBeenCalledWith("/modules/m-2", {
			method: "DELETE",
		});
		expect(result).toEqual({ success: true, id: "m-2" });
	});

	it("loads class subject options", async () => {
		vi.mocked(apiFetch).mockResolvedValue({
			data: [
				{
					id: "cs-1",
					class: { name: "X-IPA 1" },
					subject: { name: "Matematika", code: "MAT-10" },
					teacher: {
						teacher_number: "T001",
						profile: { fullName: "Pak Budi" },
					},
					academic_year: { academic_year: "2026/2027" },
				},
			],
		});

		const options = await getClassSubjectOptions();
		expect(options).toHaveLength(1);
		expect(options[0]).toEqual({
			id: "cs-1",
			label: "X-IPA 1 • Matematika (Pak Budi)",
			className: "X-IPA 1",
			subjectName: "Matematika",
			teacherName: "Pak Budi",
			academicYear: "2026/2027",
		});
	});
});

