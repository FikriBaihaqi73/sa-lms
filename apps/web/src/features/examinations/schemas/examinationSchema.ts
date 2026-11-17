import { z } from "zod";

export const examinationFormSchema = z.object({
  classSubjectId: z.string().uuid("Mata pelajaran kelas wajib dipilih."),
  assignmentTypeId: z.string().uuid("Jenis tugas tidak valid.").optional().or(z.literal("")),
  title: z.string().min(1, "Judul ujian wajib diisi.").max(255, "Judul ujian maksimal 255 karakter."),
  description: z.string().optional(),
  examinationDate: z.string().optional(),
  examinationTime: z.string().optional(),
  duration: z.number().int("Durasi harus berupa bilangan bulat.").min(0, "Durasi tidak boleh negatif.").max(2147483647, "Durasi melebihi batas teknis.").optional(),
  maximumScore: z.number().min(0, "Nilai maksimum tidak boleh negatif.").max(999.99, "Nilai maksimum tidak boleh lebih dari 999,99.").optional(),
}).superRefine((values, context) => {
  if (values.examinationDate && !values.examinationTime) context.addIssue({ code: "custom", path: ["examinationTime"], message: "Jam pelaksanaan wajib diisi jika tanggal dipilih." });
  if (!values.examinationDate && values.examinationTime) context.addIssue({ code: "custom", path: ["examinationDate"], message: "Tanggal pelaksanaan wajib diisi jika jam dipilih." });
});

export type ExaminationFormValues = z.infer<typeof examinationFormSchema>;
