
import { z } from "zod";

export const academicYearSchema = z.object({
	academic_year: z.string().min(1, "Academic year is required"),
	is_active: z.boolean(),
});

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;
