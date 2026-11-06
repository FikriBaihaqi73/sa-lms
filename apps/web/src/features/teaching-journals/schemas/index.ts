import { z } from "zod";

export const teachingJournalFormSchema = z.object({
	schedule_id: z.string().min(1, "Pilih jadwal pelajaran terlebih dahulu"),
	meeting_number: z
		.number()
		.int("Nomor pertemuan harus berupa bilangan bulat")
		.min(1, "Nomor pertemuan minimal 1")
		.nullable()
		.optional(),
	journal_date: z.string().nullable().optional(),
	topic: z
		.string()
		.max(255, "Topik bahasan maksimal 255 karakter")
		.nullable()
		.optional(),
	material: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
});

export type TeachingJournalFormValues = z.infer<
	typeof teachingJournalFormSchema
>;

export const teachingJournalFilterSchema = z.object({
	search: z.string().optional(),
	schedule_id: z.string().optional(),
	journal_date: z.string().optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).default(10),
});

export type TeachingJournalFilterValues = z.infer<
	typeof teachingJournalFilterSchema
>;
