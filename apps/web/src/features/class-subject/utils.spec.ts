import { describe, expect, it } from "vitest";
import { academicYearQueryId, classSubjectDeleteError, classSubjectFieldError, classSubjectsQueryKey, filterAcademicYears, pageAfterDelete } from "./utils";

describe("class subject frontend behavior", () => {
  it("includes filters and pagination in the query key", () => {
    expect(classSubjectsQueryKey({ page: 2, limit: 25, search: "math", class_id: "class-1", academic_year_id: "year-1" })).toEqual(["class-subjects", { page: 2, limit: 25, search: "math", class_id: "class-1", academic_year_id: "year-1" }]);
  });
  it("uses the active year by default and no filter for Semua", () => {
    expect(academicYearQueryId("default", "year-active")).toBe("year-active");
    expect(academicYearQueryId("all", "year-active")).toBe("");
  });
  it("keeps only non-null years from the admin institution", () => {
    const years = [
      { id: "global", academic_year: "Global", is_active: true, institution_id: null },
      { id: "institution-a", academic_year: "2026/2027", is_active: true, institution_id: "institution-a" },
      { id: "institution-b", academic_year: "2026/2027", is_active: true, institution_id: "institution-b" },
    ];
    expect(filterAcademicYears(years, "institution-a").map((year) => year.id)).toEqual(["institution-a"]);
    expect(filterAcademicYears(years).map((year) => year.id)).toEqual([]);
  });
  it("moves back when deleting the last row on a later page", () => {
    expect(pageAfterDelete(3, 0)).toBe(2);
    expect(pageAfterDelete(1, 0)).toBe(1);
  });
  it("maps duplicate and validation errors to the correct form field", () => {
    expect(classSubjectFieldError(409, [])?.field).toBe("academic_year_id");
    expect(classSubjectFieldError(409, [])?.message).toContain("sudah terdaftar");
    expect(classSubjectFieldError(422, [{ field: "teacher_id", message: "Wajib diisi" }])).toEqual({ field: "teacher_id", message: "Wajib diisi" });
  });
  it("maps delete conflict to the fixed Indonesian toast message", () => {
    expect(classSubjectDeleteError(409)).toContain("tidak dapat dihapus");
    expect(classSubjectDeleteError(500)).toBeNull();
  });
});
