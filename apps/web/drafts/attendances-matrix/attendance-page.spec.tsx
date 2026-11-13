// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bulkUpsertAttendance, getAttendanceMatrixOptions, getAttendancesMatrix, upsertAttendance } from "../api";
import type { AttendanceMatrix, AttendanceMatrixOptions } from "../types";
import { AttendancesPage } from "./attendance-page";

vi.mock("../api", () => ({ getAttendanceMatrixOptions: vi.fn(), getAttendancesMatrix: vi.fn(), upsertAttendance: vi.fn(), bulkUpsertAttendance: vi.fn() }));
const scheduleId = "11111111-1111-4111-8111-111111111111";
const studentId = "22222222-2222-4222-8222-222222222222";
const presentId = "33333333-3333-4333-8333-333333333333";
const sickId = "44444444-4444-4444-8444-444444444444";
const schedule = { id: scheduleId, day: "Senin", startTime: "07:00", endTime: "08:00", classSubject: { id: "cs", academic_year_id: "year-1", class: { id: "class-1", name: "X IPA" }, subject: { id: "subject", name: "Matematika" } }, classroom: { id: "room", roomCode: "R1", roomName: "Ruang 1" } };
const options: AttendanceMatrixOptions = { academicYears: [{ id: "year-1", academic_year: "2026/2027", is_active: true }, { id: "year-2", academic_year: "2025/2026", is_active: false }], classes: [{ id: "class-1", name: "X IPA", academic_year_id: "year-1" }], schedules: [schedule], statuses: [{ id: presentId, name: "Hadir" }, { id: sickId, name: "Sakit" }] };
const initialMatrix: AttendanceMatrix = {
  schedule, students: [{ id: studentId, studentNumber: "12345", profile: { id: "profile", fullName: "Budi" } }, { id: "other", studentNumber: "99999", profile: null }],
  dates: [{ date: "2026-11-01", active: false }, { date: "2026-11-02", active: true }, { date: "2026-11-03", active: false }], records: [],
};

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={client}><AttendancesPage /></QueryClientProvider>);
  return client;
}
async function selectSchedule() {
  await screen.findByRole("option", { name: "X IPA" });
  fireEvent.change(screen.getByLabelText("Kelas"), { target: { value: "class-1" } });
  fireEvent.change(screen.getByLabelText("Jadwal / Mata Pelajaran"), { target: { value: scheduleId } });
  await screen.findByText("Budi");
}

describe("Attendance matrix page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-02T10:00:00"));
    vi.mocked(getAttendanceMatrixOptions).mockResolvedValue(options);
    vi.mocked(getAttendancesMatrix).mockResolvedValue(initialMatrix);
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("waits for a class/schedule then auto-populates students with no attendance records", async () => {
    renderPage();
    expect(screen.getByText("Presensi & Absensi Siswa")).toBeTruthy();
    await screen.findByText("Siap mencatat kehadiran");
    expect(getAttendancesMatrix).not.toHaveBeenCalled();
    await selectSchedule();
    expect(screen.getByText("NISN: 12345")).toBeTruthy();
    expect(screen.getByText("Nama belum tersedia")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Budi, 2026-11-02: Belum diisi" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Budi, 2026-11-01/ })).toBeNull();
    expect(screen.getAllByText("0% (0/2)")).toHaveLength(3);
    expect(within(screen.getByRole("region", { name: "Ringkasan kehadiran" })).getByText("Total Presensi")).toBeTruthy();
  });

  it("creates a cell with notes and refreshes the matrix and summary immediately", async () => {
    const record = { id: "record", schedule_id: scheduleId, student_id: studentId, attendance_status_id: presentId, attendance_date: "2026-11-02T00:00:00Z", attendance_status: { id: presentId, name: "Hadir" }, notes: "Tepat waktu", created_at: "", updated_at: "" };
    vi.mocked(upsertAttendance).mockImplementation(async () => {
      vi.mocked(getAttendancesMatrix).mockResolvedValue({ ...initialMatrix, records: [record] });
      return record;
    });
    renderPage(); await selectSchedule();
    fireEvent.click(screen.getByRole("button", { name: "Budi, 2026-11-02: Belum diisi" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /Hadir/ }));
    fireEvent.change(within(dialog).getByLabelText("Catatan"), { target: { value: "Tepat waktu" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Simpan Presensi" }));
    await waitFor(() => expect(upsertAttendance).toHaveBeenCalledWith(expect.objectContaining({ student_id: studentId, attendance_date: "2026-11-02", attendance_status_id: presentId, notes: "Tepat waktu" }), expect.anything()));
    expect(await screen.findByRole("button", { name: "Budi, 2026-11-02: Hadir, ada catatan" })).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByText("50% (1/2)")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the editor and notes on a failed save and allows retry", async () => {
    vi.mocked(upsertAttendance).mockRejectedValue(new Error("Database tidak tersedia"));
    renderPage(); await selectSchedule();
    fireEvent.click(screen.getByRole("button", { name: "Budi, 2026-11-02: Belum diisi" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /Sakit/ }));
    fireEvent.change(screen.getByLabelText("Catatan"), { target: { value: "Surat dokter" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Presensi" }));
    expect(await screen.findByText("Database tidak tersedia")).toBeTruthy();
    expect(screen.getByLabelText("Catatan")).toHaveProperty("value", "Surat dokter");
    expect(screen.getByRole("button", { name: "Simpan Presensi" })).toHaveProperty("disabled", false);
  });

  it("bulk updates the entire class even when search hides students", async () => {
    vi.mocked(bulkUpsertAttendance).mockResolvedValue([]);
    renderPage(); await selectSchedule();
    fireEvent.change(screen.getByLabelText("Cari siswa, NISN"), { target: { value: "12345" } });
    await waitFor(() => expect(screen.queryByText("NISN: 99999")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Set Semua Hadir 2026-11-02" }));
    await waitFor(() => expect(bulkUpsertAttendance).toHaveBeenCalledWith({ schedule_id: scheduleId, attendance_date: "2026-11-02", attendance_status_id: presentId }, expect.anything()));
  });

  it("clears dependent class/schedule selections and resets all filters", async () => {
    renderPage(); await selectSchedule();
    fireEvent.change(screen.getByLabelText("Tahun ajaran"), { target: { value: "year-2" } });
    expect(screen.getByLabelText("Kelas")).toHaveProperty("value", "");
    expect(screen.getByLabelText("Jadwal / Mata Pelajaran")).toHaveProperty("value", "");
    expect(screen.queryByText("Budi")).toBeNull();
    fireEvent.change(screen.getByLabelText("Bulan"), { target: { value: "2" } });
    fireEvent.click(screen.getByTitle("Reset Filter"));
    expect(screen.getByLabelText("Bulan")).toHaveProperty("value", "11");
    expect(screen.getByLabelText("Tahun ajaran")).toHaveProperty("value", "");
  });

  it("shows query errors with retry and handles an empty class", async () => {
    vi.mocked(getAttendancesMatrix).mockRejectedValueOnce(new Error("Network error")).mockResolvedValue({ ...initialMatrix, students: [] });
    renderPage();
    await screen.findByRole("option", { name: "X IPA" });
    fireEvent.change(screen.getByLabelText("Kelas"), { target: { value: "class-1" } });
    fireEvent.change(screen.getByLabelText("Jadwal / Mata Pelajaran"), { target: { value: scheduleId } });
    expect(await screen.findByText("Network error")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByText("Belum ada siswa terdaftar di kelas ini.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Set Semua Hadir (Hari Aktif)" })).toHaveProperty("disabled", true);
  });
});
