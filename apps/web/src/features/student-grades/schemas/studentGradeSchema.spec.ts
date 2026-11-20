import { describe, expect, it } from "vitest";
import { studentGradeFormSchema } from "./studentGradeSchema";

const ids = { studentId: "11111111-1111-4111-8111-111111111111", classSubjectId: "22222222-2222-4222-8222-222222222222", academicYearId: "33333333-3333-4333-8333-333333333333" };
describe("studentGradeFormSchema", () => {
  it("uses the backend score messages", () => {
    const result = studentGradeFormSchema.safeParse({ ...ids, finalScore: 100.01 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("finalScore maksimal 100.");
  });
  it("accepts empty optional scores", () => { expect(studentGradeFormSchema.safeParse(ids).success).toBe(true); });
});
