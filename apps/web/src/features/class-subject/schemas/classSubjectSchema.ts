import { z } from "zod";

export const classSubjectSchema = z.object({
  class_id: z.string().uuid("Kelas wajib dipilih."),
  subject_id: z.string().uuid("Mata pelajaran wajib dipilih."),
  teacher_id: z.string().uuid("Guru pengampu wajib dipilih."),
  academic_year_id: z.string().uuid("Tahun ajaran wajib dipilih."),
});

export type ClassSubjectFormInput = z.input<typeof classSubjectSchema>;
export type ClassSubjectFormValues = z.infer<typeof classSubjectSchema>;
