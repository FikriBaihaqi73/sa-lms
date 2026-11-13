import { AttendanceMatrixQuerySchema, AttendanceQuerySchema, BulkUpsertAttendanceSchema, UpsertAttendanceSchema } from "./attendance-matrix.schema";

const id = "11111111-1111-4111-8111-111111111111";
const input = { schedule_id: id, student_id: id, attendance_status_id: id, attendance_date: "2024-02-29" };

describe("attendance matrix validation", () => {
  it("accepts leap days, calendar-only dates and optional nullable notes", () => {
    expect(UpsertAttendanceSchema.parse(input)).toEqual(input);
    expect(UpsertAttendanceSchema.parse({ ...input, notes: null }).notes).toBeNull();
  });
  it.each(["2025-02-29", "2026-02-30", "2026-13-01", "2026-11-02T00:00:00Z", ""])("rejects invalid calendar date %s", (date) => {
    expect(UpsertAttendanceSchema.safeParse({ ...input, attendance_date: date }).success).toBe(false);
  });
  it("requires date and valid UUIDs, limits notes and disallows duplicate/empty bulk lists", () => {
    expect(UpsertAttendanceSchema.safeParse({ ...input, attendance_date: undefined }).success).toBe(false);
    expect(UpsertAttendanceSchema.safeParse({ ...input, student_id: "invalid" }).success).toBe(false);
    expect(UpsertAttendanceSchema.safeParse({ ...input, notes: "a".repeat(2001) }).success).toBe(false);
    expect(BulkUpsertAttendanceSchema.safeParse({ ...input, student_ids: [] }).success).toBe(false);
    expect(BulkUpsertAttendanceSchema.safeParse({ ...input, student_ids: [id, id] }).success).toBe(false);
    expect(BulkUpsertAttendanceSchema.safeParse(input).success).toBe(true);
  });
  it("validates date ranges, pagination and month/year boundaries", () => {
    expect(AttendanceQuerySchema.safeParse({ start_date: "2026-11-02", end_date: "2026-11-01" }).success).toBe(false);
    expect(AttendanceQuerySchema.safeParse({ attendance_date: "2026-11-02", start_date: "2026-11-01" }).success).toBe(false);
    expect(AttendanceQuerySchema.safeParse({ limit: "-1" }).success).toBe(false);
    expect(AttendanceMatrixQuerySchema.parse({ schedule_id: id, month: "2", year: "2024" })).toEqual({ schedule_id: id, month: 2, year: 2024 });
    expect(AttendanceMatrixQuerySchema.safeParse({ schedule_id: id, month: 13, year: 2024 }).success).toBe(false);
  });
});
