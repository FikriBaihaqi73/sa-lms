import { z } from "zod";

export const employmentStatusFormSchema = z.object({
  name: z.string().trim().min(2, "Nama status minimal 2 karakter"),
  description: z.string().max(1000, "Deskripsi maksimal 1000 karakter").optional().nullable(),
});

export type EmploymentStatusFormValues = z.infer<typeof employmentStatusFormSchema>;
