import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateAttendanceStatusSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe("Attendance status name within the institution"),
  description: z.string().optional().describe("Attendance status description"),
});

export const UpdateAttendanceStatusSchema =
  CreateAttendanceStatusSchema.partial();

export class CreateAttendanceStatusDto extends createZodDto(
  CreateAttendanceStatusSchema,
) {}
export class UpdateAttendanceStatusDto extends createZodDto(
  UpdateAttendanceStatusSchema,
) {}
