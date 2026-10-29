import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { createSubjectApi, deleteSubjectApi, getSubjectsApi, updateSubjectApi } from "./subjects";
import type { Subject } from "../types";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

const subject: Subject = {
	id: "subject-1",
	code: "MAT-101",
	name: "Matematika",
	credits: 3,
	description: null,
	institutionId: "institution-1",
	departmentId: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("Subject API", () => {
	const request = vi.mocked(apiFetch);

	beforeEach(() => vi.clearAllMocks());

	it("unwraps the nested paginated response and sends supported query parameters", async () => {
		request.mockResolvedValue({
			data: {
				data: { data: [subject], total: 1 },
			},
		});

		await expect(getSubjectsApi({ page: 2, limit: 10, search: "mat" })).resolves.toEqual({
			data: [subject],
			total: 1,
		});
		expect(request).toHaveBeenCalledWith("/subjects?page=2&limit=10&search=mat");
	});

	it("posts the create DTO and unwraps its returned subject", async () => {
		request.mockResolvedValue({ data: { data: subject } });
		const input = {
			code: subject.code,
			name: subject.name,
			credits: 3,
			institutionId: subject.institutionId,
		};

		await expect(createSubjectApi(input)).resolves.toEqual(subject);
		expect(request).toHaveBeenCalledWith("/subjects", {
			method: "POST",
			body: JSON.stringify(input),
		});
	});

	it("patches supported fields and unwraps the updated subject", async () => {
		request.mockResolvedValue({ data: { data: subject } });
		const input = { name: "Matematika Lanjut", departmentId: "department-1" };

		await expect(updateSubjectApi(subject.id, input)).resolves.toEqual(subject);
		expect(request).toHaveBeenCalledWith(`/subjects/${subject.id}`, {
			method: "PATCH",
			body: JSON.stringify(input),
		});
	});

	it("sends null to clear an optional department assignment", async () => {
		request.mockResolvedValue({ data: { data: { ...subject, departmentId: null } } });

		await updateSubjectApi(subject.id, { departmentId: null });

		expect(request).toHaveBeenCalledWith(`/subjects/${subject.id}`, {
			method: "PATCH",
			body: JSON.stringify({ departmentId: null }),
		});
	});

	it("deletes by subject ID", async () => {
		request.mockResolvedValue({ data: { data: null } });

		await expect(deleteSubjectApi(subject.id)).resolves.toBeUndefined();
		expect(request).toHaveBeenCalledWith(`/subjects/${subject.id}`, { method: "DELETE" });
	});
});
