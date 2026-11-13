import { z } from "zod";

export const moduleFormSchema = z.object({
	class_subject_id: z.string().min(1, "Pilih mata pelajaran kelas"),
	title: z.string().min(1, "Judul modul wajib diisi").max(255, "Judul modul maksimal 255 karakter"),
	description: z.string().nullable().optional(),
	display_order: z
		.number()
		.int("Urutan tampil harus berupa bilangan bulat")
		.min(1, "Urutan tampil minimal 1")
		.nullable()
		.optional(),
	is_published: z.boolean().default(false),
	is_locked: z.boolean().default(false),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const moduleFilterSchema = z.object({
	search: z.string().optional(),
	class_subject_id: z.string().optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).default(10),
});

export type ModuleFilterValues = z.infer<typeof moduleFilterSchema>;

