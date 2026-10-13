import { z } from "zod";

export const studentGuardianFormSchema = z.object({
	studentId: z.string().uuid("Siswa wajib dipilih.").describe("ID siswa yang akan dihubungkan."),
	guardianId: z.string().uuid("Wali wajib dipilih.").describe("ID wali yang akan dihubungkan."),
	isPrimary: z.boolean().describe("Menandai wali sebagai kontak utama siswa."),
});

export type StudentGuardianFormValues = z.infer<typeof studentGuardianFormSchema>;
