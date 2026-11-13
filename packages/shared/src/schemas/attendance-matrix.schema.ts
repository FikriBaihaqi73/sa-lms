import { z } from "zod";

export const AttendanceDateSchema = z.iso.date().describe("Calendar date in YYYY-MM-DD format, without a timezone");
const id = z.uuid().describe("Resource UUID");

export const UpsertAttendanceSchema = z.object({
  schedule_id: id.describe("Schedule UUID"),
  student_id: id.describe("Enrolled student UUID"),
  attendance_status_id: id.describe("Attendance status UUID belonging to the institution"),
  attendance_date: AttendanceDateSchema,
  notes: z.string().max(2000).nullable().optional().describe("Notes; omitted preserves existing notes, null or empty clears them"),
});

export const BulkUpsertAttendanceSchema = UpsertAttendanceSchema.omit({ student_id: true }).extend({
  student_ids: z.array(id).min(1).max(1000).refine((ids) => new Set(ids).size === ids.length, "Student IDs must be unique").optional().describe("Enrolled students to update; omit to update the entire class"),
});

export const AttendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe("Page number"),
  limit: z.coerce.number().int().min(1).max(1000).default(10).describe("Records per page; use /matrix for an unpaginated month"),
  search: z.string().trim().max(200).optional().describe("Search student name, student number, notes, class or subject"),
  schedule_id: id.optional().describe("Filter by schedule UUID"),
  class_id: id.optional().describe("Filter by class UUID"),
  student_id: id.optional().describe("Filter by student UUID"),
  attendance_status_id: id.optional().describe("Filter by attendance status UUID"),
  attendance_date: AttendanceDateSchema.optional().describe("Exact calendar date; cannot be combined with a date range"),
  start_date: AttendanceDateSchema.optional().describe("Inclusive start date"),
  end_date: AttendanceDateSchema.optional().describe("Inclusive end date"),
}).superRefine((value, ctx) => {
  if (value.start_date && value.end_date && value.start_date > value.end_date) {
    ctx.addIssue({ code: "custom", path: ["end_date"], message: "End date must be on or after start date" });
  }
  if (value.attendance_date && (value.start_date || value.end_date)) {
    ctx.addIssue({ code: "custom", path: ["attendance_date"], message: "Use either an exact date or a date range" });
  }
});

export const AttendanceMatrixQuerySchema = z.object({
  schedule_id: id.describe("Schedule whose class roster is loaded automatically"),
  month: z.coerce.number().int().min(1).max(12).describe("Calendar month, 1 through 12"),
  year: z.coerce.number().int().min(1900).max(2100).describe("Calendar year, independent of academic year"),
});

export type UpsertAttendanceInput = z.infer<typeof UpsertAttendanceSchema>;
export type BulkUpsertAttendanceInput = z.infer<typeof BulkUpsertAttendanceSchema>;
export type AttendanceMatrixQuery = z.infer<typeof AttendanceMatrixQuerySchema>;
