import { CreateClassSchema, UpdateClassSchema } from "./class.schema";

const validCreate = {
  academic_year_id: "22222222-2222-4222-8222-222222222222",
  name: "X IPA 1",
  grade_level: 1,
};

describe("Class schemas", () => {
  it.each([-1, 0, 1.5])("rejects invalid create grade level %s", (grade_level) => {
    expect(CreateClassSchema.safeParse({ ...validCreate, grade_level }).success).toBe(false);
  });

  it.each([1, 3, 12])("accepts valid create grade level %s", (grade_level) => {
    expect(CreateClassSchema.safeParse({ ...validCreate, grade_level }).success).toBe(true);
  });

  it("accepts create without institution and capacity", () => {
    expect(CreateClassSchema.safeParse(validCreate).success).toBe(true);
    expect(CreateClassSchema.shape).not.toHaveProperty("institution_id");
    expect(CreateClassSchema.shape).not.toHaveProperty("capacity");
  });

  it.each([-1, 0, 1.5])("rejects invalid update grade level %s", (grade_level) => {
    expect(UpdateClassSchema.safeParse({ grade_level }).success).toBe(false);
  });

  it("allows valid update values without institution or capacity", () => {
    expect(UpdateClassSchema.safeParse({ grade_level: 2 }).success).toBe(true);
    expect(UpdateClassSchema.shape).not.toHaveProperty("institution_id");
    expect(UpdateClassSchema.shape).not.toHaveProperty("capacity");
  });
});
