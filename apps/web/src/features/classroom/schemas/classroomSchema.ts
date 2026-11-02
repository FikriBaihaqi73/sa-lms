import { z } from "zod";

export const classroomFormSchema = z
	.object({
		roomCode: z
			.string()
			.trim()
			.min(1, "Kode ruangan wajib diisi")
			.max(255, "Kode ruangan maksimal 255 karakter"),
		roomName: z
			.string()
			.trim()
			.min(1, "Nama ruangan wajib diisi")
			.max(255, "Nama ruangan maksimal 255 karakter"),
		building: z
			.string()
			.trim()
			.max(255, "Gedung maksimal 255 karakter")
			.transform((v) => (v === "" ? undefined : v))
			.optional(),
		floor: z
			.number()
			.int("Lantai harus berupa bilangan bulat.")
			.min(0, "Lantai tidak boleh negatif.")
			.optional(),
		capacity: z
			.number()
			.int("Kapasitas harus berupa bilangan bulat.")
			.min(1, "Kapasitas minimal 1 kursi.")
			.optional(),
		description: z.string().trim().optional(),
	})
	.refine(
		(data) => {
			if (data.floor !== undefined && data.capacity !== undefined) {
				return data.capacity >= data.floor;
			}
			return true;
		},
		{
			message: "Kapasitas minimal harus lebih besar atau sama dengan lantai.",
			path: ["capacity"],
		},
	);

export type ClassroomFormValues = z.infer<typeof classroomFormSchema>;
