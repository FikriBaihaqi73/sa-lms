import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExaminationDialog } from "./ExaminationDialog";
import type { ExaminationFormValues } from "../schemas/examinationSchema";
import type { Examination } from "../types";

const classSubjectId = "11111111-1111-4111-8111-111111111111";

afterEach(() => cleanup());

function renderDialog(onSave: (values: ExaminationFormValues) => Promise<void> = async () => undefined, item: Examination | null = null) {
  render(<ExaminationDialog open item={item} classSubjects={[{ id: classSubjectId, label: "Kelas 1 - Matematika" }]} assignmentTypes={[]} isSaving={false} fieldError={null} onFieldChange={vi.fn()} onClose={vi.fn()} onSave={onSave} />);
  return onSave;
}

describe("ExaminationDialog", () => {
  it("submits date and time parts without losing other fields", async () => {
    const onSave = vi.fn<(values: ExaminationFormValues) => Promise<void>>(() => Promise.resolve());
    renderDialog(onSave);
    fireEvent.change(screen.getByLabelText(/Mata Pelajaran Kelas/), { target: { value: classSubjectId } });
    fireEvent.change(screen.getByLabelText("Judul Ujian"), { target: { value: "Ujian Tengah Semester" } });
    fireEvent.change(screen.getByLabelText("Tanggal Pelaksanaan"), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText("Jam Pelaksanaan"), { target: { value: "08:30" } });
    fireEvent.change(screen.getByLabelText("Durasi (menit)"), { target: { value: "90" } });
    fireEvent.change(screen.getByLabelText("Nilai Maksimum"), { target: { value: "100" } });
    fireEvent.submit(screen.getByRole("button", { name: "Tambah Ujian" }).closest("form") as HTMLFormElement);
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ examinationDate: "2026-12-01", examinationTime: "08:30", duration: 90, maximumScore: 100 }));
  });

  it("shows a specific error when only the date is filled", async () => {
    const onSave = vi.fn<(values: ExaminationFormValues) => Promise<void>>(() => Promise.resolve());
    renderDialog(onSave);
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: classSubjectId } });
    fireEvent.change(screen.getByLabelText("Judul Ujian"), { target: { value: "Ujian" } });
    fireEvent.change(screen.getByLabelText("Tanggal Pelaksanaan"), { target: { value: "2026-12-01" } });
    fireEvent.submit(screen.getByRole("button", { name: "Tambah Ujian" }).closest("form") as HTMLFormElement);
    expect(await screen.findByText("Jam pelaksanaan wajib diisi jika tanggal dipilih.")).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("loads an existing ISO date into local date and time fields", () => {
    renderDialog(vi.fn(async () => undefined), { id: "exam-1", classSubjectId, assignmentTypeId: null, title: "Ujian", description: null, examinationDate: "2026-11-30T17:00:00.000Z", duration: null, maximumScore: null, classSubject: null, assignmentType: null });
    const dateInput = screen.getByLabelText("Tanggal Pelaksanaan") as HTMLInputElement;
    const timeInput = screen.getByLabelText("Jam Pelaksanaan") as HTMLInputElement;
    expect(new Date(`${dateInput.value}T${timeInput.value}`).toISOString()).toBe("2026-11-30T17:00:00.000Z");
  });
});
