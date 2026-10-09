import { z } from "zod";

export const semesterFormSchema = z.object({
	academic_year_id: z.string().uuid("Academic Year wajib dipilih."),
	name: z.string().trim().min(1, "Nama semester wajib diisi."),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	is_active: z.boolean(),
});

export type SemesterFormValues = z.infer<typeof semesterFormSchema>;

