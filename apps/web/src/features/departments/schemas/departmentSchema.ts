import { z } from "zod";

export const departmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama departemen wajib diisi.")
    .max(255, "Nama departemen maksimal 255 karakter.")
    .describe("Nama departemen"),
  code: z
    .string()
    .trim()
    .min(1, "Kode departemen wajib diisi.")
    .max(50, "Kode departemen maksimal 50 karakter.")
    .describe("Kode unik departemen"),
  teacher_ids: z
    .array(z.string().uuid("ID guru tidak valid"))
    .optional()
    .default([])
    .describe("Daftar ID guru yang ditugaskan ke departemen"),
});

export type DepartmentFormInput = z.input<typeof departmentFormSchema>;
export type DepartmentFormValues = z.output<typeof departmentFormSchema>;
