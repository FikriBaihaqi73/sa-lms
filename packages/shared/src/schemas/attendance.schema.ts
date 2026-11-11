import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const dateStringSchema = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date format. Expected YYYY-MM-DD or ISO 8601 string",
  });

export const CreateAttendanceSchema = z.object({
  schedule_id: z
    .string()
    .uuid("Invalid schedule ID format")
    .describe("ID of the schedule"),
  student_id: z
    .string()
    .uuid("Invalid student ID format")
    .describe("ID of the student"),
  attendance_status_id: z
    .string()
    .uuid("Invalid attendance status ID format")
    .describe("ID of the attendance status"),
  attendance_date: dateStringSchema
    .optional()
    .describe("Date of the attendance (YYYY-MM-DD or ISO string)"),
  notes: z.string().optional().describe("Notes for the attendance"),
});

export const UpdateAttendanceSchema = CreateAttendanceSchema.partial();

export const UpsertAttendanceSchema = z.object({
  schedule_id: z
    .string()
    .uuid("Invalid schedule ID format")
    .describe("ID of the schedule"),
  student_id: z
    .string()
    .uuid("Invalid student ID format")
    .describe("ID of the student"),
  attendance_status_id: z
    .string()
    .uuid("Invalid attendance status ID format")
    .describe("ID of the attendance status (Hadir, Izin, Sakit, Alpa)"),
  attendance_date: dateStringSchema.describe(
    "Date of the attendance session (YYYY-MM-DD or ISO string)",
  ),
  notes: z
    .string()
    .optional()
    .nullable()
    .describe("Optional notes or remarks for this student session"),
});

export const BulkUpsertAttendanceSchema = z.object({
  schedule_id: z
    .string()
    .uuid("Invalid schedule ID format")
    .describe("ID of the schedule to mark attendance for"),
  attendance_date: dateStringSchema.describe(
    "Date of the attendance session (YYYY-MM-DD or ISO string)",
  ),
  attendance_status_id: z
    .string()
    .uuid("Invalid attendance status ID format")
    .describe("ID of the attendance status to apply (e.g. Hadir)"),
  student_ids: z
    .array(z.string().uuid("Invalid student ID format"))
    .optional()
    .describe(
      "Optional list of student IDs. If omitted or empty, applies to all students in the class",
    ),
  notes: z
    .string()
    .optional()
    .nullable()
    .describe("Optional notes to apply to the bulk records"),
});

export const AttendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe("Page number"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(10)
    .describe("Number of records per page"),
  search: z
    .string()
    .optional()
    .describe("Search term for student name, student number, or notes"),
  schedule_id: z
    .string()
    .uuid("Invalid schedule ID format")
    .optional()
    .describe("Filter by schedule ID"),
  class_id: z
    .string()
    .uuid("Invalid class ID format")
    .optional()
    .describe("Filter by class ID"),
  student_id: z
    .string()
    .uuid("Invalid student ID format")
    .optional()
    .describe("Filter by student ID"),
  attendance_status_id: z
    .string()
    .uuid("Invalid attendance status ID format")
    .optional()
    .describe("Filter by attendance status ID"),
  attendance_date: dateStringSchema
    .optional()
    .describe("Filter by exact attendance date"),
  start_date: dateStringSchema
    .optional()
    .describe("Filter start date range (inclusive)"),
  end_date: dateStringSchema
    .optional()
    .describe("Filter end date range (inclusive)"),
  month: z.coerce
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .describe("Filter by month (1 - 12)"),
  year: z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .optional()
    .describe("Filter by year (e.g. 2026)"),
});

export class CreateAttendanceDto extends createZodDto(CreateAttendanceSchema) {}
export class UpdateAttendanceDto extends createZodDto(UpdateAttendanceSchema) {}
export class UpsertAttendanceDto extends createZodDto(UpsertAttendanceSchema) {}
export class BulkUpsertAttendanceDto extends createZodDto(
  BulkUpsertAttendanceSchema,
) {}
export class AttendanceQueryDto extends createZodDto(AttendanceQuerySchema) {}
