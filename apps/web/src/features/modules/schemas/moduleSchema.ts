import { z } from "zod";

export const moduleFormSchema = z.object({
  class_subject_id: z.string().min(1, "Mata pelajaran kelas wajib dipilih"),
  title: z
    .string()
    .min(1, "Judul modul wajib diisi")
    .max(200, "Judul modul maksimal 200 karakter"),
  description: z.string().nullable().optional(),
  display_order: z.number().int().nullable().optional(),
  is_published: z.boolean(),
  is_locked: z.boolean(),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const moduleContentFormSchema = z.object({
  moduleId: z.string().min(1, "ID modul wajib terisi"),
  title: z
    .string()
    .min(1, "Judul konten materi wajib diisi")
    .max(255, "Judul konten materi maksimal 255 karakter"),
  contentType: z.string().min(1, "Tipe konten wajib dipilih"),
  content: z.string().nullable().optional(),
  fileId: z.string().nullable().optional(),
  sortOrder: z.number().int().nullable().optional(),
});

export type ModuleContentFormValues = z.infer<typeof moduleContentFormSchema>;
