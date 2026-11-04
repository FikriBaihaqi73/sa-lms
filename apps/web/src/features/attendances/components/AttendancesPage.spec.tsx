// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AttendancesPage } from "./AttendancesPage";
import {
  deleteAttendanceApi,
  getAttendancesApi,
  getAttendanceSummaryApi,
} from "../api/attendances";
import type { Attendance, AttendanceSummary } from "../types";

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "admin-user", role: "admin" },
  }),
}));

vi.mock("../api/attendances", () => ({
  getAttendancesApi: vi.fn(),
  getAttendanceSummaryApi: vi.fn(),
  getAttendanceByIdApi: vi.fn(),
  createAttendanceApi: vi.fn(),
  updateAttendanceApi: vi.fn(),
  deleteAttendanceApi: vi.fn(),
}));

vi.mock("@/features/classes/hooks/useClasses", () => ({
  useClasses: () => ({
    data: {
      data: [{ id: "class-1", name: "X-IPA-1", grade_level: 10 }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/attendance-statuses/hooks/useAttendanceStatuses", () => ({
  useAttendanceStatuses: () => ({
    data: {
      data: [
        { id: "stat-hadir", name: "Hadir", description: "Hadir di kelas" },
        { id: "stat-izin", name: "Izin", description: "Izin berhalangan" },
      ],
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/schedules/hooks/useSchedules", () => ({
  useSchedules: () => ({
    data: {
      data: [
        {
          id: "sch-1",
          day: "Senin",
          startTime: "07:30",
          endTime: "09:00",
          classSubject: {
            class: { name: "X-IPA-1" },
            subject: { name: "Matematika" },
          },
        },
      ],
      meta: { currentPage: 1, perPage: 100, totalData: 1, totalPages: 1 },
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/students/hooks/useStudents", () => ({
  useStudents: () => ({
    data: {
      data: [
        {
          id: "stu-1",
          studentNumber: "123456",
          profile: { fullName: "Ahmad Dahlan" },
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    },
    isLoading: false,
  }),
}));

const mockAttendance: Attendance = {
  id: "att-1",
  schedule_id: "sch-1",
  student_id: "stu-1",
  attendance_status_id: "stat-hadir",
  attendance_date: "2026-11-04T00:00:00.000Z",
  notes: "Tepat waktu",
  created_at: "2026-11-04T00:00:00.000Z",
  updated_at: "2026-11-04T00:00:00.000Z",
  attendance_status: {
    id: "stat-hadir",
    name: "Hadir",
    description: "Hadir tepat waktu",
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
    day: "Senin",
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
    vi.mocked(getAttendancesApi).mockResolvedValue({
      data: [mockAttendance],
      meta: {
        currentPage: 1,
        perPage: 10,
        totalData: 1,
        totalPages: 1,
      },
    });
    vi.mocked(getAttendanceSummaryApi).mockResolvedValue(mockSummary);
  });

  afterEach(cleanup);

  it("renders page header, summary stats, filter bar, and attendance rows", async () => {
    renderPage();

    // Check header
    expect(screen.getByText("Presensi & Absensi Siswa")).toBeTruthy();
    expect(
      screen.getByText(
        "Pantau, catat, dan rekap data kehadiran siswa per kelas dan jadwal pelajaran.",
      ),
    ).toBeTruthy();

    // Check stats
    expect(await screen.findByText("80%")).toBeTruthy();
    expect(screen.getByText("Total Presensi")).toBeTruthy();

    // Check student in table
    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
    expect(screen.getByText("NISN: 123456")).toBeTruthy();
    expect(screen.getByText("X-IPA-1 • Matematika")).toBeTruthy();
    expect(screen.getAllByText("Hadir").length).toBeGreaterThanOrEqual(1);
  });

  it("opens create modal when clicking 'Catat Presensi'", async () => {
    renderPage();
    await screen.findByText("Ahmad Dahlan");

    const createBtn = screen.getByRole("button", { name: /catat presensi/i });
    fireEvent.click(createBtn);

    expect(await screen.findByText("Catat Presensi Siswa")).toBeTruthy();
    expect(screen.getByText("Jadwal Pelajaran")).toBeTruthy();
  });

  it("opens edit modal when clicking edit button in table", async () => {
    renderPage();
    await screen.findByText("Ahmad Dahlan");

    const editBtn = screen.getByTitle("Ubah Presensi");
    fireEvent.click(editBtn);

    expect(await screen.findByText("Ubah Presensi Siswa")).toBeTruthy();
  });

  it("opens delete confirmation dialog and triggers delete mutation", async () => {
    vi.mocked(deleteAttendanceApi).mockResolvedValueOnce();

    renderPage();
    await screen.findByText("Ahmad Dahlan");

    const deleteBtn = screen.getByTitle("Hapus Presensi");
    fireEvent.click(deleteBtn);

    expect(await screen.findByText("Hapus Data Presensi")).toBeTruthy();
    expect(
      screen.getByText(/Apakah Anda yakin ingin menghapus data presensi status/i),
    ).toBeTruthy();

    const confirmDeleteBtn = screen.getByTestId("confirm-delete-button");
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(deleteAttendanceApi).toHaveBeenCalledWith("att-1");
    });
  });

  it("filters attendances and resets filters", async () => {
    renderPage();
    await screen.findByText("Ahmad Dahlan");

    const searchInput = screen.getByPlaceholderText("Cari siswa, NISN, atau pelajaran...");
    fireEvent.change(searchInput, { target: { value: "Ahmad" } });

    const dateInput = screen.getByLabelText("Filter tanggal kehadiran");
    fireEvent.change(dateInput, { target: { value: "2026-11-04" } });

    const classSelect = screen.getByLabelText("Filter kelas");
    fireEvent.change(classSelect, { target: { value: "class-1" } });

    // Reset button should now appear
    const resetBtn = await screen.findByTitle("Reset Filter");
    expect(resetBtn).toBeTruthy();

    fireEvent.click(resetBtn);
    expect(searchInput).toHaveProperty("value", "");
    expect(dateInput).toHaveProperty("value", "");
    expect(classSelect).toHaveProperty("value", "");
  });

  it("shows empty state when no attendances found", async () => {
    vi.mocked(getAttendancesApi).mockResolvedValueOnce({
      data: [],
      meta: {
        currentPage: 1,
        perPage: 10,
        totalData: 0,
        totalPages: 1,
      },
    });

    renderPage();
    expect(await screen.findByText("Belum ada data presensi")).toBeTruthy();
  });

  it("shows error state and offers retry button on query failure", async () => {
    vi.mocked(getAttendancesApi)
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValueOnce({
        data: [mockAttendance],
        meta: {
          currentPage: 1,
          perPage: 10,
          totalData: 1,
          totalPages: 1,
        },
      });

    renderPage();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("Network Error")).toBeTruthy();

    const retryBtn = screen.getByRole("button", { name: /coba lagi/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
  });
});
