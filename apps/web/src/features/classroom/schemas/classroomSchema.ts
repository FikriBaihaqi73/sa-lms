
import { CLASSROOM_INT32_MAX } from "@repo/shared/schemas/classroom.constants";
import { z } from "zod";

const floorSchema = z
	.number({ message: "Lantai harus berupa angka bulat, misalnya 0, 1, atau 2." })
	.refine(Number.isInteger, "Lantai harus berupa angka bulat, tanpa desimal.")
	.min(0, "Lantai tidak boleh kurang dari 0.")
	.max(CLASSROOM_INT32_MAX, "Nomor lantai terlalu besar. Masukkan angka yang lebih kecil.")
	.nullable()
	.optional();

const capacitySchema = z
	.number({ message: "Kapasitas harus berupa angka bulat, misalnya 30." })
	.refine(Number.isInteger, "Kapasitas harus berupa angka bulat, tanpa desimal.")
	.min(1, "Kapasitas minimal 1 kursi.")
	.max(CLASSROOM_INT32_MAX, "Kapasitas terlalu besar. Masukkan angka yang lebih kecil.")
	.nullable()
	.optional();

export const classroomFormSchema = z.object({
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
	floor: floorSchema,
	capacity: capacitySchema,
	description: z.string().trim().nullable().optional(),
});

export type ClassroomFormValues = z.infer<typeof classroomFormSchema>;
