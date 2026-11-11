import { z } from "zod";

export const studyPlanFormSchema = z.object({
	student_id: z.string().min(1, "Pilih siswa terlebih dahulu"),
	class_subject_id: z
		.string()
		.min(1, "Pilih mata pelajaran kelas terlebih dahulu"),
	academic_year_id: z.string().min(1, "Pilih tahun ajaran terlebih dahulu"),
});

export type StudyPlanFormValues = z.infer<typeof studyPlanFormSchema>;
