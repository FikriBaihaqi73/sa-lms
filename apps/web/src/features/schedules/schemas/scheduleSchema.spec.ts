import { describe, expect, it } from "vitest";
import {
  SCHEDULE_DAYS,
  scheduleFormSchema,
  type ScheduleFormValues,
} from "./scheduleSchema";

const validSchedule: ScheduleFormValues = {
  day: "Senin",
  classSubjectId: "11111111-1111-4111-8111-111111111111",
  classroomId: "22222222-2222-4222-8222-222222222222",
  startTime: "07:30",
  endTime: "09:00",
};

describe("scheduleFormSchema", () => {
  it("accepts a valid schedule form", () => {
    const result = scheduleFormSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it.each(SCHEDULE_DAYS)("accepts valid day %s", (day) => {
    const result = scheduleFormSchema.safeParse({ ...validSchedule, day });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid day", () => {
    const result = scheduleFormSchema.safeParse({
      ...validSchedule,
      day: "HariLibur",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty classSubjectId", () => {
    const result = scheduleFormSchema.safeParse({
      ...validSchedule,
      classSubjectId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Pilihan mata pelajaran kelas wajib dipilih.",
      );
    }
  });

  it("rejects empty classroomId", () => {
    const result = scheduleFormSchema.safeParse({
      ...validSchedule,
      classroomId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Pilihan ruangan wajib dipilih.");
    }
  });

  it("rejects end time earlier than start time", () => {
    const result = scheduleFormSchema.safeParse({
      ...validSchedule,
      startTime: "10:00",
      endTime: "08:30",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((e) => e.path.join("."));
      expect(paths).toContain("endTime");
      expect(result.error.issues.find((e) => e.path.includes("endTime"))?.message).toBe(
        "Jam selesai harus lebih akhir daripada jam mulai.",
      );
    }
  });

  it("rejects end time identical to start time", () => {
    const result = scheduleFormSchema.safeParse({
      ...validSchedule,
      startTime: "09:00",
      endTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional or empty start and end time without time order conflict", () => {
    const result = scheduleFormSchema.safeParse({
      ...validSchedule,
      startTime: "",
      endTime: "",
    });
    expect(result.success).toBe(true);
  });
});
