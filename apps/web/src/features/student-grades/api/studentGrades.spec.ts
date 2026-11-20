import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { getStudentGradesApi } from "./studentGrades";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));
describe("student grade API", () => {
  it("serializes supported filters without institutionId", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: { data: [], meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 } } });
    await getStudentGradesApi({ page: 2, limit: 25, search: "Siswa", classSubjectId: "cs", academicYearId: "ay" });
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith("/student-grades?page=2&limit=25&search=Siswa&classSubjectId=cs&academicYearId=ay");
  });
});
