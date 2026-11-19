import { z } from "zod";

export const announcementFormSchema = z.object({
  title: z
    .string()
    .min(1, "Judul pengumuman wajib diisi")
    .max(255, "Judul tidak boleh melebihi 255 karakter"),
  targetAudience: z.enum(["ALL", "TEACHER", "STUDENT"], {
    error: "Target penerima tidak valid",
  }),
  category: z.enum(["GENERAL", "ACADEMIC", "EVENT", "IMPORTANT"], {
    error: "Kategori pengumuman tidak valid",
  }),
  content: z.string().min(1, "Isi pengumuman wajib diisi"),
  isPublished: z.boolean(),
  publishedAt: z.string().optional().nullable(),
  expiredAt: z.string().optional().nullable(),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
