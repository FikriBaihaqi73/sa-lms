import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import {
  createScheduleApi,
  deleteScheduleApi,
  getScheduleByIdApi,
  getScheduleOptionsApi,
  getSchedulesApi,
  updateScheduleApi,
} from "./schedules";
import type { Schedule } from "../types";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

const mockSchedule: Schedule = {
  id: "schedule-1",
  classSubjectId: "cs-1",
  classroomId: "room-1",
  day: "Senin",
  startTime: "2026-01-01T07:30:00.000Z",
  endTime: "2026-01-01T09:00:00.000Z",
  classroom: {
    id: "room-1",
    roomName: "Lab Komputer 1",
    roomCode: "LAB-01",
    building: "Gedung B",
    capacity: 35,
  },
  classSubject: {
    id: "cs-1",
    class: {
      id: "class-1",
      name: "X RPL 1",
    },
    subject: {
      id: "subj-1",
      name: "Pemrograman Web",
      code: "WEB-01",
    },
    teacher: {
      id: "teacher-1",
      teacher_number: "T-001",
      profile: {
        id: "profile-1",
        fullName: "Budi Santoso, S.Kom.",
      },
    },
    academic_year: {
      id: "ay-1",
      academic_year: "2026/2027",
    },
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
};

describe("Schedules API", () => {
  const request = vi.mocked(apiFetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSchedulesApi", () => {
    it("handles array response and constructs query string with all parameters", async () => {
      request.mockResolvedValueOnce({
        data: [mockSchedule],
        meta: {
          currentPage: 1,
          perPage: 10,
          totalData: 1,
          totalPages: 1,
        },
      });

      const result = await getSchedulesApi({
        page: 1,
        limit: 10,
        search: "RPL",
        day: "Senin",
        classroomId: "room-1",
        classSubjectId: "cs-1",
      });

      expect(result).toEqual({
        data: [mockSchedule],
        meta: {
          currentPage: 1,
          perPage: 10,
          totalData: 1,
          totalPages: 1,
        },
      });

      expect(request).toHaveBeenCalledWith(
        "/schedules?page=1&limit=10&search=RPL&day=Senin&classroomId=room-1&classSubjectId=cs-1",
      );
    });

    it("handles nested data object structure", async () => {
      request.mockResolvedValueOnce({
        data: {
          data: [mockSchedule],
          meta: {
            currentPage: 2,
            perPage: 5,
            totalData: 6,
            totalPages: 2,
          },
        },
      });

      const result = await getSchedulesApi({ page: 2, limit: 5 });
      expect(result.data).toEqual([mockSchedule]);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.totalData).toBe(6);
    });

    it("returns empty data array if response is empty or null", async () => {
      request.mockResolvedValueOnce({ data: null });

      const result = await getSchedulesApi();
      expect(result.data).toEqual([]);
      expect(result.meta.totalData).toBe(0);
    });
  });

  describe("getScheduleByIdApi", () => {
    it("fetches single schedule by ID", async () => {
      request.mockResolvedValueOnce({ data: mockSchedule });

      const result = await getScheduleByIdApi("schedule-1");
      expect(result).toEqual(mockSchedule);
      expect(request).toHaveBeenCalledWith("/schedules/schedule-1");
    });
  });

  describe("createScheduleApi", () => {
    it("posts valid schedule payload and unwraps response", async () => {
      request.mockResolvedValueOnce({ data: mockSchedule });

      const payload = {
        classSubjectId: "cs-1",
        classroomId: "room-1",
        day: "Senin",
        startTime: "07:30",
        endTime: "09:00",
      };

      const result = await createScheduleApi(payload);
      expect(result).toEqual(mockSchedule);
      expect(request).toHaveBeenCalledWith("/schedules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    });
  });

  describe("updateScheduleApi", () => {
    it("patches schedule fields and unwraps response", async () => {
      const updatedSchedule = { ...mockSchedule, day: "Selasa" };
      request.mockResolvedValueOnce({ data: updatedSchedule });

      const patchData = {
        day: "Selasa",
        startTime: "08:00",
        endTime: "10:00",
      };

      const result = await updateScheduleApi("schedule-1", patchData);
      expect(result).toEqual(updatedSchedule);
      expect(request).toHaveBeenCalledWith("/schedules/schedule-1", {
        method: "PATCH",
        body: JSON.stringify({
          day: "Selasa",
          startTime: "08:00",
          endTime: "10:00",
        }),
      });
    });
  });

  describe("deleteScheduleApi", () => {
    it("calls delete on schedule endpoint", async () => {
      request.mockResolvedValueOnce({
        data: { success: true, id: "schedule-1" },
      });

      const result = await deleteScheduleApi("schedule-1");
      expect(result).toEqual({ success: true, id: "schedule-1" });
      expect(request).toHaveBeenCalledWith("/schedules/schedule-1", {
        method: "DELETE",
      });
    });
  });

  describe("getScheduleOptionsApi", () => {
    it("aggregates class subjects and classrooms with formatted options", async () => {
      request
        .mockResolvedValueOnce({
          data: [
            {
              id: "cs-1",
              class: { name: "X RPL 1" },
              subject: { name: "Pemrograman Web", code: "WEB-01" },
              teacher: { profile: { fullName: "Budi Santoso, S.Kom." } },
              academic_year: { academic_year: "2026/2027" },
            },
          ],
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: "room-1",
              roomName: "Lab Komputer 1",
              roomCode: "LAB-01",
              building: "Gedung B",
              capacity: 35,
            },
          ],
        });

      const options = await getScheduleOptionsApi();

      expect(options.classSubjects).toHaveLength(1);
      expect(options.classSubjects[0]?.label).toContain("[X RPL 1] Pemrograman Web");
      expect(options.classSubjects[0]?.teacherName).toBe("Budi Santoso, S.Kom.");

      expect(options.classrooms).toHaveLength(1);
      expect(options.classrooms[0]?.roomName).toBe("Lab Komputer 1");
      expect(options.classrooms[0]?.roomCode).toBe("LAB-01");
    });
  });
});
