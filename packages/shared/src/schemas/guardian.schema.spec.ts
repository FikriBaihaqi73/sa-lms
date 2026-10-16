import { CreateGuardianSchema } from "./guardian.schema";

describe("CreateGuardianSchema", () => {
  const baseGuardian = {
    fullName: "Jane Doe",
  };

  it("requires a student selection", () => {
    const result = CreateGuardianSchema.safeParse(baseGuardian);

    expect(result.success).toBe(false);
  });

  it("accepts a valid student UUID", () => {
    const result = CreateGuardianSchema.safeParse({
      ...baseGuardian,
      studentId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid student UUID", () => {
    const result = CreateGuardianSchema.safeParse({
      ...baseGuardian,
      studentId: "student-id",
    });

    expect(result.success).toBe(false);
  });
});
