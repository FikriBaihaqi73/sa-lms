import { z } from "zod";

export const addClassStudentSchema = z.object({
	classId: z.string().min(1, "Kelas wajib dipilih"),
	studentIds: z.array(z.string().min(1)).min(1, "Pilih minimal 1 siswa"),
});

export type AddClassStudentFormValues = z.infer<typeof addClassStudentSchema>;
