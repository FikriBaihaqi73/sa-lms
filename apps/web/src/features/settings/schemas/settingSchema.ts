import { z } from "zod";

export const settingFormSchema = z.object({
	settingKey: z
		.string()
		.trim()
		.min(1, "Kunci pengaturan wajib diisi")
		.regex(
			/^[A-Za-z0-9_.-]+$/,
			"Kunci hanya boleh berisi huruf, angka, garis bawah (_), titik (.), atau tanda hubung (-)",
		),
	settingValue: z.string().optional(),
	description: z.string().optional(),
});

export type SettingFormValues = z.infer<typeof settingFormSchema>;
