import { z } from "zod";

const optionalText = (message: string) =>
	z.string().trim().max(255, message).optional().or(z.literal(""));

export const institutionFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Nama institusi wajib diisi.")
		.max(255, "Nama terlalu panjang."),
	institutionLevelId: z.string().uuid("Jenjang institusi wajib dipilih."),
	shortName: optionalText("Nama singkat terlalu panjang."),
	city: optionalText("Kota terlalu panjang."),
	province: optionalText("Provinsi terlalu panjang."),
	address: optionalText("Alamat terlalu panjang."),
	phoneNumber: optionalText("Nomor telepon terlalu panjang."),
	email: z
		.string()
		.trim()
		.optional()
		.or(z.literal(""))
		.refine((value) => !value || /.+@.+\..+/.test(value), {
			message: "Format email tidak valid.",
		}),
	website: z.string().trim().optional().or(z.literal("")),
});

export type InstitutionFormValues = z.infer<typeof institutionFormSchema>;
