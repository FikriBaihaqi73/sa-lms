import { describe, expect, it } from "vitest";
import { classFormSchema } from "./classSchema";

const validForm = {
  academic_year_id: "22222222-2222-4222-8222-222222222222",
  name: "X IPA 1",
  grade_level: 1,
};

describe("classFormSchema", () => {
  it.each([-1, 0, 1.5])("rejects invalid grade level %s", (grade_level) => {
    expect(classFormSchema.safeParse({ ...validForm, grade_level }).success).toBe(false);
  });

  it.each([1, 2, 12])("accepts valid grade level %s", (grade_level) => {
    expect(classFormSchema.safeParse({ ...validForm, grade_level }).success).toBe(true);
  });

  it("does not include institution or capacity in the form contract", () => {
    expect(classFormSchema.safeParse(validForm).success).toBe(true);
    expect(classFormSchema.shape).not.toHaveProperty("institution_id");
    expect(classFormSchema.shape).not.toHaveProperty("capacity");
  });
});
