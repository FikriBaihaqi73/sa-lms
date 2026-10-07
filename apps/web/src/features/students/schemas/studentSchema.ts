import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
  z.number().int("Tahun masuk harus berupa bilangan bulat.").optional(),
);

export const studentFormSchema = z.object({
  profileId: z.string().uuid("Profil mahasiswa wajib dipilih."),
  departmentId: z.string().uuid("Departemen tidak valid.").optional().or(z.literal("")),
  academicStatusId: z.string().uuid("Status akademik wajib dipilih."),
  studentNumber: z.string().trim().min(1, "Nomor mahasiswa wajib diisi."),
  enrollmentYear: optionalNumber,
});

export type StudentFormInput = z.input<typeof studentFormSchema>;
export type StudentFormValues = z.output<typeof studentFormSchema>;

