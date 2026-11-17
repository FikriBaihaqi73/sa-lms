import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExaminationsPage } from "./ExaminationsPage";

vi.mock("../hooks/useExaminations", () => ({
  useExaminations: () => ({ data: { data: [], meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 } }, isPending: false, isError: false }),
  useExaminationStats: () => ({ data: { total: 5, upcoming: 2, completed: 3, withoutDate: 0 }, isPending: false, isError: false }),
  useCreateExamination: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateExamination: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeleteExamination: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock("@/features/class-subject/hooks/useClassSubjects", () => ({ useClassSubjects: () => ({ data: { data: [] } }) }));
vi.mock("@/features/assignment-types/hooks/useAssignmentTypes", () => ({ useAssignmentTypes: () => ({ data: [] }) }));

describe("ExaminationsPage", () => {
  it("shows the empty state and create action", () => {
    const client = new QueryClient();
    render(<QueryClientProvider client={client}><ExaminationsPage /></QueryClientProvider>);
    expect(screen.getByRole("heading", { name: "Ujian" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tambah Ujian/i })).toBeTruthy();
    expect(screen.getByText("Belum ada ujian")).toBeTruthy();
    expect(screen.getByText("AKAN DATANG")).toBeTruthy();
    expect(screen.getByText("Dijadwalkan setelah waktu sekarang")).toBeTruthy();
    expect(screen.getByLabelText("3. DARI TANGGAL")).toBeTruthy();
    expect(screen.getByLabelText("4. SAMPAI TANGGAL")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});
