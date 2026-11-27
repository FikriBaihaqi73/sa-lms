import { z } from "zod";

export const ATTENDANCE_DAYS = [
	"SENIN",
	"SELASA",
	"RABU",
	"KAMIS",
	"JUMAT",
	"SABTU",
	"MINGGU",
] as const;

export const ATTENDANCE_DAY_SHORT_LABELS: Record<
	(typeof ATTENDANCE_DAYS)[number],
	string
> = {
	SENIN: "Sen",
	SELASA: "Sel",
	RABU: "Rab",
	KAMIS: "Kam",
	JUMAT: "Jum",
	SABTU: "Sab",
	MINGGU: "Min",
};

export const ATTENDANCE_DAY_LABELS: Record<
	(typeof ATTENDANCE_DAYS)[number],
	string
> = {
	SENIN: "Senin",
	SELASA: "Selasa",
	RABU: "Rabu",
	KAMIS: "Kamis",
	JUMAT: "Jumat",
	SABTU: "Sabtu",
	MINGGU: "Minggu",
};

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(val: string): number | null {
	const match = timePattern.exec(val.trim());
	if (!match) return null;
	return Number(match[1]) * 60 + Number(match[2]);
}

export const attendanceScheduleFormSchema = z
	.object({
		academicYearId: z
			.string()
			.uuid("Tahun ajaran wajib dipilih")
			.describe("Tahun ajaran"),
		classId: z.string().uuid("Kelas wajib dipilih").describe("Kelas"),
		scheduleType: z.enum(["FROM_SCHEDULE", "STANDALONE"]),
		scheduleId: z.string().nullable().optional(),
		title: z
			.string()
			.trim()
			.min(1, "Nama jadwal absensi wajib diisi")
			.max(255, "Nama jadwal absensi maksimal 255 karakter"),
		activeDays: z.array(z.enum(ATTENDANCE_DAYS)),
		specificDate: z.string().optional(),
		startTime: z.string().optional(),
		endTime: z.string().optional(),
		isActive: z.boolean(),
		notes: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
	})
	.superRefine((data, ctx) => {
		if (data.scheduleType === "FROM_SCHEDULE" && !data.scheduleId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["scheduleId"],
				message: "Pilih jadwal pelajaran terlebih dahulu",
			});
		}
		if (
			data.startTime &&
			data.startTime.trim() !== "" &&
			!timePattern.test(data.startTime.trim())
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["startTime"],
				message: "Format jam mulai harus HH:mm",
			});
		}
		if (
			data.endTime &&
			data.endTime.trim() !== "" &&
			!timePattern.test(data.endTime.trim())
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["endTime"],
				message: "Format jam selesai harus HH:mm",
			});
		}
		if (data.startTime?.trim() && data.endTime?.trim()) {
			const startMin = toMinutes(data.startTime);
			const endMin = toMinutes(data.endTime);
			if (startMin !== null && endMin !== null && endMin <= startMin) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["endTime"],
					message: "Jam selesai harus lebih besar dari jam mulai",
				});
			}
		}
	});

export type AttendanceScheduleFormValues = z.infer<
	typeof attendanceScheduleFormSchema
>;
