import { createZodDto } from "nestjs-zod/dto";

import { z } from "zod";
import { CLASSROOM_INT32_MAX } from "./classroom.constants.js";

export { CLASSROOM_INT32_MAX } from "./classroom.constants.js";


const floorSchema = z
  .number({
    message: "Lantai harus berupa angka bulat, misalnya 0, 1, atau 2.",
  })
  .refine(Number.isInteger, "Lantai harus berupa angka bulat, tanpa desimal.")
  .min(0, "Lantai tidak boleh kurang dari 0.")
  .max(
    CLASSROOM_INT32_MAX,
    "Nomor lantai terlalu besar. Masukkan angka yang lebih kecil.",
  )
  .optional()
  .nullable();

const capacitySchema = z
  .number({ message: "Kapasitas harus berupa angka bulat, misalnya 30." })
  .refine(
    Number.isInteger,
    "Kapasitas harus berupa angka bulat, tanpa desimal.",
  )
  .min(1, "Kapasitas minimal 1 kursi.")
  .max(
    CLASSROOM_INT32_MAX,
    "Kapasitas terlalu besar. Masukkan angka yang lebih kecil.",
  )
  .optional()
  .nullable();

export const CreateClassroomSchema = z.object({
  institutionId: z.string().uuid().describe("Institution ID"),

  roomCode: z.string().min(1).max(255).describe("Classroom room code"),

  roomName: z.string().min(1).max(255).describe("Classroom room name"),

  building: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .describe("Classroom building"),

  floor: floorSchema.describe("Classroom floor"),

  capacity: capacitySchema.describe("Classroom capacity"),

  description: z
    .string()
    .optional()
    .nullable()
    .describe("Classroom description"),
});

export const UpdateClassroomSchema = CreateClassroomSchema.partial();

export class CreateClassroomDto extends createZodDto(CreateClassroomSchema) {}

export class UpdateClassroomDto extends createZodDto(UpdateClassroomSchema) {}
