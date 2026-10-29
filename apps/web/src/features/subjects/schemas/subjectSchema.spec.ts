import { describe, expect, it } from "vitest";
import { subjectSchema } from "./subjectSchema";

describe("subjectSchema", () => {
	it("accepts a valid subject with optional credits and department", () => {
		expect(subjectSchema.safeParse({
			code: " MAT-101 ",
			name: " Matematika ",
			credits: 3,
			description: "Aljabar dasar",
			departmentId: "550e8400-e29b-41d4-a716-446655440000",
		}).success).toBe(true);
	});

	it.each([
		{ code: "", name: "Matematika", credits: undefined, description: "", departmentId: "" },
		{ code: "MAT-101", name: "", credits: undefined, description: "", departmentId: "" },
		{ code: "MAT-101", name: "Matematika", credits: -1, description: "", departmentId: "" },
		{ code: "MAT-101", name: "Matematika", credits: 1.5, description: "", departmentId: "" },
		{ code: "MAT-101", name: "Matematika", credits: undefined, description: "", departmentId: "not-a-uuid" },
	])("rejects invalid field values: %o", (input) => {
		expect(subjectSchema.safeParse(input).success).toBe(false);
	});

	it("enforces backend text length limits", () => {
		expect(subjectSchema.safeParse({
			code: "C".repeat(101),
			name: "Matematika",
			credits: undefined,
			description: "",
			departmentId: "",
		}).success).toBe(false);
		expect(subjectSchema.safeParse({
			code: "MAT-101",
			name: "Matematika",
			credits: undefined,
			description: "D".repeat(1001),
			departmentId: "",
		}).success).toBe(false);
	});
});
