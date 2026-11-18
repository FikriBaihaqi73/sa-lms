import { z } from "zod";

export const studyResultFormSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  academicYearId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  semesterId: z.string().min(1, "Semester wajib dipilih"),
  totalCredits: z
    .number()
    .int("Total SKS harus berupa bilangan bulat")
    .min(0, "Total SKS minimal 0")
    .max(100, "Total SKS maksimal 100")
    .nullable()
    .optional(),
  semesterGpa: z
    .number()
    .min(0, "IPS minimal 0.00")
    .max(4.0, "IPS maksimal 4.00")
    .nullable()
    .optional(),
  cumulativeGpa: z
    .number()
    .min(0, "IPK minimal 0.00")
    .max(4.0, "IPK maksimal 4.00")
    .nullable()
    .optional(),
  academicStatusId: z.string().nullable().optional(),
});

export type StudyResultFormValues = z.infer<typeof studyResultFormSchema>;
