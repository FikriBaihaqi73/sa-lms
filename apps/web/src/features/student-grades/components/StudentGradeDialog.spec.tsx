import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentGradeDialog } from "./StudentGradeDialog";

describe("StudentGradeDialog", () => {
  const props = { open: true, classSubjects: [{ id: "22222222-2222-4222-8222-222222222222", label: "Matematika - X" }], academicYears: [{ id: "33333333-3333-4333-8333-333333333333", label: "2026/2027" }], students: [{ id: "11111111-1111-4111-8111-111111111111", label: "Siswa (STD-1)" }], grades: [], isSaving: false, fieldError: null, onFieldChange: vi.fn(), onClose: vi.fn(), onSave: vi.fn().mockResolvedValue(undefined) };
  it("starts optional score inputs empty and keeps a valid zero", () => { render(<StudentGradeDialog {...props} />); const scores = screen.getAllByRole("spinbutton"); expect(scores).toHaveLength(5); expect(scores.every((input) => (input as HTMLInputElement).value === "")).toBe(true); fireEvent.change(scores[0], { target: { value: "0" } }); expect((scores[0] as HTMLInputElement).value).toBe("0"); });
  it("keeps the footer actions visible in the dialog structure", () => { render(<StudentGradeDialog {...props} />); expect(screen.getByRole("button", { name: "Batal" })).toBeTruthy(); expect(screen.getByRole("button", { name: "Tambah Nilai" })).toBeTruthy(); expect(screen.getByRole("dialog").querySelector("form > div.min-h-0.flex-1")).toBeTruthy(); });
});
