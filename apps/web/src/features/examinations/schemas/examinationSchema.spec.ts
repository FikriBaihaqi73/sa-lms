import { describe, expect, it } from "vitest";
import { examinationFormSchema } from "./examinationSchema";

describe("examinationFormSchema", () => {
  it("requires class subject and title with Indonesian messages", () => {
    const result = examinationFormSchema.safeParse({ classSubjectId: "", title: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining(["Mata pelajaran kelas wajib dipilih.", "Judul ujian wajib diisi."]));
  });

  it("rejects duration and maximum score outside the backend limits", () => {
    const result = examinationFormSchema.safeParse({ classSubjectId: "11111111-1111-4111-8111-111111111111", title: "Ujian", duration: -1, maximumScore: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining(["Durasi tidak boleh negatif.", "Nilai maksimum tidak boleh lebih dari 999,99."]));
  });

  it("requires both examination date parts together", () => {
    const base = { classSubjectId: "11111111-1111-4111-8111-111111111111", title: "Ujian" };
    const dateOnly = examinationFormSchema.safeParse({ ...base, examinationDate: "2026-12-01" });
    const timeOnly = examinationFormSchema.safeParse({ ...base, examinationTime: "08:30" });
    expect(dateOnly.success).toBe(false);
    expect(timeOnly.success).toBe(false);
    if (!dateOnly.success) expect(dateOnly.error.issues).toContainEqual(expect.objectContaining({ path: ["examinationTime"], message: "Jam pelaksanaan wajib diisi jika tanggal dipilih." }));
    if (!timeOnly.success) expect(timeOnly.error.issues).toContainEqual(expect.objectContaining({ path: ["examinationDate"], message: "Tanggal pelaksanaan wajib diisi jika jam dipilih." }));
  });
});
