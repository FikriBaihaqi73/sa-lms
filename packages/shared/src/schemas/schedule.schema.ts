import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const CreateScheduleSchema = z.object({
  classSubjectId: z
    .string()
    .uuid("Class subject ID harus berupa UUID valid")
    .describe("Class subject ID"),
  classroomId: z
    .string()
    .uuid("Classroom ID harus berupa UUID valid")
    .describe("Classroom ID"),
  day: z.string().min(1, "Hari wajib diisi").describe("Schedule day"),
  startTime: z
    .string()
    .refine(
      (val) => !val || !Number.isNaN(Date.parse(val)) || timePattern.test(val),
      {
        message: "Format waktu mulai tidak valid (HH:mm atau ISO 8601)",
      },
    )
    .optional()
    .nullable()
    .describe("Start time (HH:mm or ISO 8601)"),
  endTime: z
    .string()
    .refine(
      (val) => !val || !Number.isNaN(Date.parse(val)) || timePattern.test(val),
      {
        message: "Format waktu selesai tidak valid (HH:mm atau ISO 8601)",
      },
    )
    .optional()
    .nullable()
    .describe("End time (HH:mm or ISO 8601)"),
});

export const UpdateScheduleSchema = CreateScheduleSchema.partial();

export class CreateScheduleDto extends createZodDto(CreateScheduleSchema) {}
export class UpdateScheduleDto extends createZodDto(UpdateScheduleSchema) {}
