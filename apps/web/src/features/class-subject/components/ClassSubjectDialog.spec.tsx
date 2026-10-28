// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClassSubjectDialog } from "./ClassSubjectDialog";

const options = {
  classes: [{ id: "11111111-1111-4111-8111-111111111111", name: "X IPA" }],
  subjects: [{ id: "22222222-2222-4222-8222-222222222222", name: "Matematika" }],
  teachers: [{ id: "33333333-3333-4333-8333-333333333333", teacher_number: "G-1", profile: { fullName: "Guru" } }],
  academicYears: [
    { id: "44444444-4444-4444-8444-444444444444", academic_year: "2026/2027", is_active: true, institution_id: "inst-1" },
    { id: "66666666-6666-4666-8666-666666666666", academic_year: "2027/2028", is_active: false, institution_id: "inst-1" },
  ],
};

const item = {
  id: "55555555-5555-4555-8555-555555555555",
  class_id: options.classes[0].id,
  subject_id: options.subjects[0].id,
  teacher_id: options.teachers[0].id,
  academic_year_id: options.academicYears[0].id,
  class: { id: options.classes[0].id, name: "X IPA" },
  subject: { id: options.subjects[0].id, name: "Matematika" },
  teacher: { id: options.teachers[0].id, teacher_number: "G-1", profile: { fullName: "Guru" } },
  academic_year: options.academicYears[0],
};

function renderDialog(serverError: { field: string; message: string } | null = null, selectedItem = item) {
  return render(
    <ClassSubjectDialog
      open
      item={selectedItem}
      options={options}
      isSaving={false}
      serverError={serverError}
      onFieldChange={vi.fn()}
      onClose={vi.fn()}
      onSave={vi.fn(async () => undefined)}
    />,
  );
}

describe("ClassSubjectDialog", () => {
  afterEach(() => cleanup());
  it("resets edited values when opened for a new item", () => {
    const { rerender } = renderDialog();
    rerender(
      <ClassSubjectDialog
        open
        item={null}
        options={options}
        isSaving={false}
        onFieldChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn(async () => undefined)}
      />,
    );

    expect((screen.getByLabelText("Kelas") as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText("Mata Pelajaran") as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText("Guru Pengampu") as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText("Tahun Ajaran") as HTMLSelectElement).value).toBe("");
  });

  it("notifies the parent to clear a server field error when that field changes", () => {
    const onFieldChange = vi.fn();
    render(
      <ClassSubjectDialog
        open
        item={item}
        options={options}
        isSaving={false}
        serverError={{ field: "academic_year_id", message: "Duplikat" }}
        onFieldChange={onFieldChange}
        onClose={vi.fn()}
        onSave={vi.fn(async () => undefined)}
      />,
    );
    expect(screen.getByText("Duplikat")).not.toBeNull();

    fireEvent.change(screen.getByLabelText("Tahun Ajaran"), {
      target: { value: options.academicYears[1].id },
    });

    expect(onFieldChange).toHaveBeenCalledTimes(1);
  });
});
