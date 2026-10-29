import { CreateSubjectSchema, UpdateSubjectSchema } from "./subject.schema";

describe("Subject schemas", () => {
	const subject = {
		code: "MAT-101",
		name: "Matematika",
		institutionId: "550e8400-e29b-41d4-a716-446655440000",
	};

	it("requires a valid institution ID when creating a subject", () => {
		expect(CreateSubjectSchema.safeParse(subject).success).toBe(true);
		expect(CreateSubjectSchema.safeParse({ ...subject, institutionId: "invalid" }).success).toBe(false);
	});

	it("allows null departmentId only in updates to clear the optional relation", () => {
		expect(UpdateSubjectSchema.safeParse({ departmentId: null }).success).toBe(true);
		expect(UpdateSubjectSchema.safeParse({ departmentId: "invalid" }).success).toBe(false);
		expect(CreateSubjectSchema.safeParse({ ...subject, departmentId: null }).success).toBe(false);
	});
});
