import { z } from "zod";

export const assignmentFormSchema = z.object({
	title: z
		.string()
		.min(1, "Judul tugas wajib diisi")
		.max(255, "Judul tugas maksimal 255 karakter")
		.describe("Judul penugasan"),
	module_id: z
		.string()
		.min(1, "Modul pembelajaran wajib dipilih")
		.describe("ID Modul pembelajaran"),
	assignment_type_id: z
		.string()
		.min(1, "Tipe penugasan wajib dipilih")
		.describe("ID Tipe penugasan"),
	due_date: z
		.string()
		.min(1, "Batas waktu pengumpulan (due date) wajib diisi")
		.describe("Batas waktu pengumpulan tugas"),
	max_score: z
		.number()
		.min(1, "Skor maksimal minimal 1 poin")
		.max(1000, "Skor maksimal tidak boleh melebihi 1000")
		.default(100)
		.describe("Skor maksimal penugasan"),
	description: z
		.string()
		.optional()
		.nullable()
		.describe("Instruksi atau petunjuk pengerjaan tugas"),
});

export type AssignmentFormData = z.infer<typeof assignmentFormSchema>;
