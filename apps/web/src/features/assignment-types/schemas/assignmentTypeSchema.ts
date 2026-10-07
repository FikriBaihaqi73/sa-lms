import { z } from "zod";

export const assignmentTypeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama tipe tugas wajib diisi")
    .max(100, "Nama tipe tugas maksimal 100 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export type AssignmentTypeFormValues = z.infer<typeof assignmentTypeFormSchema>;
