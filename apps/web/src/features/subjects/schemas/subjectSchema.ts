import { z } from "zod";

export const subjectSchema = z.object({
	code: z.string().trim().min(1, "Kode mata pelajaran wajib diisi.").max(100, "Kode maksimal 100 karakter."),
	name: z.string().trim().min(1, "Nama mata pelajaran wajib diisi.").max(255, "Nama maksimal 255 karakter."),
	credits: z.number().int("Jumlah kredit harus bilangan bulat.").nonnegative("Jumlah kredit tidak boleh negatif.").optional(),
	description: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter."),
	departmentId: z.union([z.uuid(), z.literal("")]),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
