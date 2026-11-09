import { z } from "zod";

const optionalUuid = z
	.string()
	.uuid("Pilihan tidak valid.")
	.optional()
	.or(z.literal(""))
	.nullable();

export const createTeacherSchema = z.object({
	// Akun Login & Profil
	full_name: z
		.string()
		.trim()
		.min(1, "Nama lengkap guru wajib diisi.")
		.max(255, "Nama lengkap maksimal 255 karakter."),
	email: z
		.string()
		.trim()
		.min(1, "Email wajib diisi.")
		.email("Format email tidak valid.")
		.max(255, "Email maksimal 255 karakter."),
	password: z
		.string()
		.min(8, "Password awal minimal 8 karakter.")
		.max(100, "Password maksimal 100 karakter."),
	gender: z.string().optional().or(z.literal("")).nullable(),
	phone: z.string().trim().optional().or(z.literal("")).nullable(),

	// Data Kepegawaian
	teacher_number: z
		.string()
		.trim()
		.min(1, "NIP / Nomor Induk Pengajar wajib diisi.")
		.max(100, "NIP maksimal 100 karakter."),
	join_date: z.string().trim().optional().or(z.literal("")).nullable(),
	employment_status_id: optionalUuid,
	specialization_id: optionalUuid,
	department_id: optionalUuid,
});

export const updateTeacherSchema = z.object({
	// Akun Login & Profil
	full_name: z
		.string()
		.trim()
		.min(1, "Nama lengkap guru wajib diisi.")
		.max(255, "Nama lengkap maksimal 255 karakter."),
	email: z
		.string()
		.trim()
		.min(1, "Email wajib diisi.")
		.email("Format email tidak valid.")
		.max(255, "Email maksimal 255 karakter."),
	password: z
		.string()
		.refine((val) => val === "" || val.length >= 8, {
			message: "Password baru minimal 8 karakter jika ingin diubah.",
		})
		.optional()
		.or(z.literal(""))
		.nullable(),
	gender: z.string().optional().or(z.literal("")).nullable(),
	phone: z.string().trim().optional().or(z.literal("")).nullable(),

	// Data Kepegawaian
	teacher_number: z
		.string()
		.trim()
		.min(1, "NIP / Nomor Induk Pengajar wajib diisi.")
		.max(100, "NIP maksimal 100 karakter."),
	join_date: z.string().trim().optional().or(z.literal("")).nullable(),
	employment_status_id: optionalUuid,
	specialization_id: optionalUuid,
	department_id: optionalUuid,
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherFormValues = z.infer<typeof updateTeacherSchema>;

// Aliases for compatibility
export type TeacherFormValues = CreateTeacherFormValues;
