import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import {
  createAttendanceApi,
  deleteAttendanceApi,
  getAttendanceByIdApi,
  getAttendancesApi,
  getAttendanceSummaryApi,
  updateAttendanceApi,
} from "./attendances";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

describe("attendances API client", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getAttendancesApi", () => {
    it("fetches attendance list with query params and extracts meta correctly", async () => {
      const mockData = [
        {
          id: "att-1",
          schedule_id: "sch-1",
          student_id: "stu-1",
          attendance_status_id: "stat-1",
          attendance_date: "2026-11-04T00:00:00.000Z",
          notes: "Hadir tepat waktu",
          created_at: "2026-11-04T00:00:00.000Z",
          updated_at: "2026-11-04T00:00:00.000Z",
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce({
        data: mockData,
        meta: {
          currentPage: 1,
          perPage: 10,
          totalData: 1,
          totalPages: 1,
        },
      });

      const result = await getAttendancesApi({
        page: 1,
        limit: 10,
        search: "Budi",
        class_id: "cls-1",
        attendance_status_id: "stat-1",
        attendance_date: "2026-11-04",
      });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("page=1&limit=10&search=Budi&attendance_status_id=stat-1&class_id=cls-1&attendance_date=2026-11-04"),
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalData).toBe(1);
    });

    it("handles nested data.data response format", async () => {
      const mockData = [
        {
          id: "att-2",
          schedule_id: "sch-2",
          student_id: "stu-2",
          attendance_status_id: "stat-2",
          attendance_date: null,
          notes: null,
          created_at: "2026-11-04T00:00:00.000Z",
          updated_at: "2026-11-04T00:00:00.000Z",
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce({
        data: {
          data: mockData,
          meta: {
            currentPage: 2,
            perPage: 5,
            totalData: 6,
            totalPages: 2,
          },
        },
      });

      const result = await getAttendancesApi({ page: 2, limit: 5 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });

    it("returns empty structure when response has no data", async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce(null);

      const result = await getAttendancesApi({ page: 1, limit: 10 });
      expect(result.data).toEqual([]);
      expect(result.meta.totalData).toBe(0);
    });
  });

  describe("getAttendanceSummaryApi", () => {
    it("fetches attendance summary metrics", async () => {
      const mockSummary = {
        total: 100,
        present: 80,
        permission: 10,
        sick: 5,
        absent: 5,
        attendanceRate: 80,
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ data: mockSummary });

      const result = await getAttendanceSummaryApi({
        class_id: "cls-1",
        attendance_date: "2026-11-04",
      });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/attendances/summary?class_id=cls-1&attendance_date=2026-11-04"),
      );
      expect(result).toEqual(mockSummary);
    });

    it("returns fallback zeros when response data is missing", async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({ data: null });

      const result = await getAttendanceSummaryApi();
      expect(result.total).toBe(0);
      expect(result.present).toBe(0);
      expect(result.attendanceRate).toBe(0);
    });
  });

  describe("CRUD operations", () => {
    it("getAttendanceByIdApi calls single endpoint", async () => {
      const item = { id: "att-1" };
      vi.mocked(apiFetch).mockResolvedValueOnce({ data: item });

      const result = await getAttendanceByIdApi("att-1");
      expect(apiFetch).toHaveBeenCalledWith("/attendances/att-1");
      expect(result).toEqual(item);
    });

    it("createAttendanceApi sends POST request with json body", async () => {
      const payload = {
        schedule_id: "11111111-1111-1111-1111-111111111111",
        student_id: "22222222-2222-2222-2222-222222222222",
        attendance_status_id: "33333333-3333-3333-3333-333333333333",
        attendance_date: "2026-11-04T00:00:00.000Z",
        notes: "Izin dokter",
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ data: { id: "new-att", ...payload } });

      const result = await createAttendanceApi(payload);
      expect(apiFetch).toHaveBeenCalledWith("/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(result.id).toBe("new-att");
    });

    it("updateAttendanceApi sends PATCH request", async () => {
      const updateData = { notes: "Catatan diupdate" };
      vi.mocked(apiFetch).mockResolvedValueOnce({ data: { id: "att-1", ...updateData } });

      const result = await updateAttendanceApi("att-1", updateData);
      expect(apiFetch).toHaveBeenCalledWith("/attendances/att-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      expect(result.notes).toBe("Catatan diupdate");
    });

    it("deleteAttendanceApi sends DELETE request", async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({ message: "Deleted" });

      await deleteAttendanceApi("att-1");
      expect(apiFetch).toHaveBeenCalledWith("/attendances/att-1", {
        method: "DELETE",
      });
    });
  });
});

