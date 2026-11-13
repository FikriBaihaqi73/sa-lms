// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bulkUpsertAttendance,
  getAcademicYearsOptions,
  getAttendanceStatusesOptions,
  getAttendanceSummary,
  getAttendances,
  getClassesOptions,
  getClassStudentsOptions,
  getSchedulesOptions,
} from "../api";
import type { Attendance, AttendanceSummary } from "../types";
import { AttendancesPage } from "./attendances-page";

vi.mock("../api", () => ({
  getAttendances: vi.fn(),
  getAttendanceSummary: vi.fn(),
  getAttendanceById: vi.fn(),
  createAttendance: vi.fn(),
  upsertAttendance: vi.fn(),
  bulkUpsertAttendance: vi.fn(),
  updateAttendance: vi.fn(),
  deleteAttendance: vi.fn(),
  getClassesOptions: vi.fn(),
  getSchedulesOptions: vi.fn(),
  getAttendanceStatusesOptions: vi.fn(),
  getAcademicYearsOptions: vi.fn(),
  getClassStudentsOptions: vi.fn(),
  getAttendancesApi: vi.fn(),
  getAttendanceSummaryApi: vi.fn(),
}));

const mockAttendance: Attendance = {
  id: "att-1",
  schedule_id: "sch-1",
  student_id: "stu-1",
  attendance_status_id: "stat-hadir",
  attendance_date: "2026-11-10T00:00:00.000Z",
  notes: "Hadir tepat waktu",
  created_at: "2026-11-10T00:00:00.000Z",
  updated_at: "2026-11-10T00:00:00.000Z",
  attendance_status: {
    id: "stat-hadir",
    name: "Hadir",
    description: "Hadir di kelas",
  },
  student: {
    id: "stu-1",
    studentNumber: "123456",
    profile: {
      id: "prof-1",
      fullName: "Ahmad Dahlan",
      email: "ahmad@example.com",
    },
  },
  schedule: {
    id: "sch-1",
    day: "Selasa",
    startTime: "07:30",
    endTime: "09:00",
    classroom: {
      id: "cr-1",
      roomCode: "R101",
      roomName: "Lab Komputer 1",
    },
    classSubject: {
      id: "cs-1",
      class: {
        id: "class-1",
        name: "X-IPA-1",
        grade_level: 10,
      },
      subject: {
        id: "sub-1",
        name: "Matematika",
        code: "MAT-10",
      },
      teacher: {
        id: "tch-1",
        teacher_number: "T001",
        profile: {
          id: "tp-1",
          fullName: "Budi Santoso",
        },
      },
    },
  },
};

const mockSummary: AttendanceSummary = {
  total: 10,
  present: 8,
  permission: 1,
  sick: 1,
  absent: 0,
  attendanceRate: 80,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AttendancesPage />
    </QueryClientProvider>,
  );
}

describe("AttendancesPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getAttendances).mockResolvedValue({
      data: [mockAttendance],
      meta: {
        currentPage: 1,
        perPage: 10,
        totalData: 1,
        totalPages: 1,
      },
    });
    vi.mocked(getAttendanceSummary).mockResolvedValue(mockSummary);
    vi.mocked(getClassesOptions).mockResolvedValue([
      { id: "class-1", name: "X-IPA-1", grade_level: 10 },
    ]);
    vi.mocked(getSchedulesOptions).mockResolvedValue([
      {
        id: "sch-1",
        day: "Selasa",
        startTime: "07:30",
        endTime: "09:00",
        classId: "class-1",
        className: "X-IPA-1",
        subjectName: "Matematika",
        teacherName: "Budi Santoso",
        classroomName: "Lab Komputer 1",
        label: "[X-IPA-1] Matematika (Budi Santoso)",
      },
    ]);
    vi.mocked(getAttendanceStatusesOptions).mockResolvedValue([
      { id: "stat-hadir", name: "Hadir", typeCategory: "hadir" },
      { id: "stat-izin", name: "Izin", typeCategory: "izin" },
      { id: "stat-sakit", name: "Sakit", typeCategory: "sakit" },
      { id: "stat-alpa", name: "Alpa", typeCategory: "alpa" },
    ]);
    vi.mocked(getAcademicYearsOptions).mockResolvedValue([
      { id: "ay-1", name: "2026/2027", is_active: true },
    ]);
    vi.mocked(getClassStudentsOptions).mockResolvedValue([
      {
        studentId: "stu-1",
        studentNumber: "123456",
        fullName: "Ahmad Dahlan",
        className: "X-IPA-1",
      },
    ]);
  });

  afterEach(cleanup);

  it("renders page header, summary stats cards, filter bar, and student row in matrix", async () => {
    renderPage();

    // Header
    expect(screen.getByText("Overview & Report Presensi Siswa")).toBeTruthy();
    expect(screen.getByText("Set Semua Hadir Hari Ini")).toBeTruthy();
    expect(screen.getByText("Ekspor Rekap")).toBeTruthy();

    // 6 Summary cards
    expect(screen.getByText("Total Presensi")).toBeTruthy();
    expect(screen.getByText("Hadir")).toBeTruthy();
    expect(screen.getByText("Izin")).toBeTruthy();
    expect(screen.getByText("Sakit")).toBeTruthy();
    expect(screen.getByText("Alpa")).toBeTruthy();
    expect(screen.getByText("Tingkat Kehadiran")).toBeTruthy();

    // Student in table
    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
    expect(await screen.findByText(/123456/)).toBeTruthy();
    expect(screen.getByText("Rata-Rata Keseluruhan")).toBeTruthy();
  });

  it("triggers bulk mark present today when clicking top button", async () => {
    vi.mocked(bulkUpsertAttendance).mockResolvedValueOnce([mockAttendance]);

    renderPage();
    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();

    const setAllTodayBtn = screen.getByRole("button", {
      name: /Set Semua Hadir Hari Ini/i,
    });
    fireEvent.click(setAllTodayBtn);

    await waitFor(() => {
      expect(bulkUpsertAttendance).toHaveBeenCalled();
    });
  });

  it("filters students by search input and resets filter", async () => {
    renderPage();
    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();

    const searchInput = screen.getByPlaceholderText(
      "Cari nama / NISN siswa...",
    );
    fireEvent.change(searchInput, { target: { value: "Zul" } });

    // Ahmad should be filtered out
    await waitFor(() => {
      expect(screen.queryByText("Ahmad Dahlan")).toBeNull();
    });

    // Reset filters
    const resetBtn = screen.getByRole("button", { name: /reset filter/i });
    fireEvent.click(resetBtn);

    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
  });

  it("shows empty state when no students or attendances exist", async () => {
    vi.mocked(getAttendances).mockResolvedValueOnce({
      data: [],
      meta: {
        currentPage: 1,
        perPage: 10,
        totalData: 0,
        totalPages: 1,
      },
    });
    vi.mocked(getClassStudentsOptions).mockResolvedValueOnce([]);

    renderPage();
    expect(
      await screen.findByText("Belum ada data siswa atau presensi"),
    ).toBeTruthy();
  });

  it("shows error state with retry on fetch failure", async () => {
    vi.mocked(getAttendances).mockRejectedValue(
      new Error("Gagal mengambil data"),
    );

    renderPage();

    const retryBtn = await screen.findByRole(
      "button",
      { name: /coba lagi/i },
      { timeout: 4000 },
    );

    vi.mocked(getAttendances).mockResolvedValue({
      data: [mockAttendance],
      meta: {
        currentPage: 1,
        perPage: 10,
        totalData: 1,
        totalPages: 1,
      },
    });

    fireEvent.click(retryBtn);

    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
  });

  it("displays Sunday as Libur and other days as Aktif in matrix header", async () => {
    renderPage();

    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
    await waitFor(() =>
      expect(screen.queryByText(/memuat matriks/i)).toBeNull(),
    );

    // Check for presence of 'Libur' and 'Aktif' chips in the matrix header
    const liburChips = await screen.findAllByText("Libur");
    const aktifChips = await screen.findAllByText("Aktif");

    expect(liburChips.length).toBeGreaterThan(0);
    expect(aktifChips.length).toBeGreaterThan(0);
  });

  it("opens attendance dialog when cell pill button is clicked", async () => {
    renderPage();

    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
    await waitFor(() =>
      expect(screen.queryByText(/memuat matriks/i)).toBeNull(),
    );

    // Find the status pill buttons for the student
    const pillButtons = await screen.findAllByTestId(/^attendance-pill-stu-1/);
    expect(pillButtons.length).toBeGreaterThan(0);

    // Click the first cell pill button
    const targetPill = pillButtons[0];
    if (targetPill) {
      fireEvent.click(targetPill);
    }

    // The dialog header should show up
    expect(await screen.findByText("Status Kehadiran Siswa")).toBeTruthy();
    expect(screen.getByText("PILIH STATUS KEHADIRAN")).toBeTruthy();
    expect(screen.getByText("CATATAN / KETERANGAN (OPSIONAL)")).toBeTruthy();
  });
});
