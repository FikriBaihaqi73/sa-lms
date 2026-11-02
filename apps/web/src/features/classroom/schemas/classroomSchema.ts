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
			.nullable()
			.optional(),
		floor: z
			.number({ message: "Lantai harus berupa bilangan bulat." })
			.int("Lantai harus berupa bilangan bulat.")
			.min(0, "Lantai tidak boleh negatif.")
			.nullable()
			.optional(),
		capacity: z
			.number({ message: "Kapasitas harus berupa bilangan bulat." })
			.int("Kapasitas harus berupa bilangan bulat.")
			.min(1, "Kapasitas minimal 1 kursi.")
			.nullable()
			.optional(),
		description: z.string().trim().nullable().optional(),
	})
	.refine(
		(data) => {
			if (
				data.floor !== undefined &&
				data.floor !== null &&
				data.capacity !== undefined &&
				data.capacity !== null
			) {
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
