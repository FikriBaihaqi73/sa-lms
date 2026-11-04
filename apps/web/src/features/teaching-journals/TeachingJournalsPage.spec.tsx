// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getJournal, getJournals } from "./api";
import { TeachingJournalsPage } from "./TeachingJournalsPage";
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "admin-a" } }) }));
vi.mock("./api", () => ({ getJournals: vi.fn(), getJournal: vi.fn() }));
const journal = { id: "j1", schedule_id: "12345678-1234-1234-1234-123456789abc", meeting_number: 1, journal_date: "2026-01-02T00:00:00.000Z", topic: "Aljabar", material: "Variabel", notes: null, schedule: { id: "s", day: "Senin", startTime: null, endTime: null } };
const result = { data: [journal], meta: { currentPage: 1, perPage: 10, totalData: 12, totalPages: 2 } };
function show() { const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); return render(<QueryClientProvider client={client}><TeachingJournalsPage /></QueryClientProvider>); }
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getJournals).mockResolvedValue(result); vi.mocked(getJournal).mockResolvedValue(journal); });
afterEach(cleanup);
describe("Jurnal Mengajar", () => {
  it("shows loading, list, and read-only detail", async () => {
    show(); expect(screen.getByText("Memuat jurnal...")).toBeTruthy();
    expect(await screen.findByText("Aljabar")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /tambah|edit|hapus/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Lihat detail" }));
    expect(await screen.findByText("Variabel")).toBeTruthy();
    expect(getJournal).toHaveBeenCalledWith("j1");
  });
  it("applies search, date and schedule filters and resets pagination", async () => {
    show(); await screen.findByText("Aljabar");
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    await waitFor(() => expect(getJournals).toHaveBeenCalledWith({ page: 2, limit: 10 }));
    fireEvent.change(screen.getByLabelText("Pencarian"), { target: { value: "  matematika " } });
    fireEvent.change(screen.getByLabelText("Tanggal mengajar"), { target: { value: "2026-01-02" } });
    fireEvent.change(screen.getByLabelText("ID jadwal"), { target: { value: journal.schedule_id } });
    fireEvent.click(screen.getByRole("button", { name: "Terapkan filter" }));
    await waitFor(() => expect(getJournals).toHaveBeenCalledWith({ page: 1, limit: 10, search: "matematika", journal_date: "2026-01-02", schedule_id: journal.schedule_id }));
  });
  it("validates schedule IDs without issuing a query", async () => {
    show(); await screen.findByText("Aljabar");
    fireEvent.change(screen.getByLabelText("ID jadwal"), { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "Terapkan filter" }));
    expect(screen.getByRole("alert").textContent).toContain("UUID");
    expect(getJournals).toHaveBeenCalledTimes(1);
  });
  it("shows empty state", async () => {
    vi.mocked(getJournals).mockResolvedValue({ data: [], meta: { currentPage: 1, perPage: 10, totalData: 0, totalPages: 0 } });
    show(); expect(await screen.findByText("Tidak ada jurnal yang sesuai.")).toBeTruthy();
  });
  it("shows errors and offers retry", async () => {
    vi.mocked(getJournals).mockRejectedValueOnce(new Error("failed")).mockResolvedValueOnce(result);
    show(); expect(await screen.findByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByText("Aljabar")).toBeTruthy();
  });
  it("shows detail errors and offers retry", async () => {
    vi.mocked(getJournal).mockRejectedValueOnce(new Error("failed")).mockResolvedValueOnce(journal);
    show(); await screen.findByText("Aljabar"); fireEvent.click(screen.getByRole("button", { name: "Lihat detail" }));
    expect(await screen.findByText("Gagal memuat detail jurnal.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByText("Variabel")).toBeTruthy();
  });
});
