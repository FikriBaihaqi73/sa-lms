import { z } from "zod";
export const classFormSchema = z.object({
  institution_id: z.string().uuid(),
  homeroom_teacher_id: z.string().uuid().nullable().optional(),
  academic_year_id: z.string().uuid(),
  name: z.string().min(1),
  grade_level: z.coerce.number().int(),
  capacity: z.coerce.number().int().nullable().optional(),
});
export type ClassFormValues = z.infer<typeof classFormSchema>;