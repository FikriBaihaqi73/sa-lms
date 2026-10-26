import { z } from "zod";
export const classFormSchema = z.object({
  homeroom_teacher_id: z.string().uuid().nullable().optional(),
  academic_year_id: z.string().uuid(),
  name: z.string().min(1),
  grade_level: z.coerce
    .number()
    .int("Tingkatan kelas minimal 1 dan harus berupa bilangan bulat.")
    .min(1, "Tingkatan kelas minimal 1 dan harus berupa bilangan bulat."),
});
export type ClassFormInput = z.input<typeof classFormSchema>;
export type ClassFormValues = z.infer<typeof classFormSchema>;
