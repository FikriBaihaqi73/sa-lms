import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateSpecializationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama peminatan / konsentrasi minimal 2 karakter")
    .max(255, "Nama peminatan / konsentrasi maksimal 255 karakter")
    .describe("Specialization name (e.g. Rekayasa Perangkat Lunak, Kecerdasan Buatan)"),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .nullable()
    .describe("Specialization description or scope of expertise"),
});

export const UpdateSpecializationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama peminatan / konsentrasi minimal 2 karakter")
    .max(255, "Nama peminatan / konsentrasi maksimal 255 karakter")
    .optional()
    .describe("Updated specialization name"),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .nullable()
    .describe("Updated specialization description"),
});

export class CreateSpecializationDto extends createZodDto(
  CreateSpecializationSchema,
) {}
export class UpdateSpecializationDto extends createZodDto(
  UpdateSpecializationSchema,
) {}

