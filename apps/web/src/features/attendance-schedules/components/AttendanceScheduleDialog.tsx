import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { UpsertAttendanceSchedulePayload } from "../api";
import {
	ATTENDANCE_DAY_LABELS,
	ATTENDANCE_DAYS,
	type AttendanceScheduleFormValues,
	attendanceScheduleFormSchema,
} from "../schemas/attendanceScheduleSchema";
import type {
	AttendanceDay,
	AttendanceScheduleAcademicYear,
	AttendanceScheduleClass,
	AttendanceScheduleItem,
	ScheduleOptionItem,
} from "../types";
import { formatTimeHHmm } from "./AttendanceSchedulesTable";

interface AttendanceScheduleDialogProps {
	open: boolean;
	editingItem: AttendanceScheduleItem | null;
	academicYears: AttendanceScheduleAcademicYear[];
	classes: AttendanceScheduleClass[];
	schedules: ScheduleOptionItem[];
	defaultAcademicYearId?: string;
	isSubmitting?: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: UpsertAttendanceSchedulePayload) => Promise<void>;
}

function mapDayStringToEnum(day: string): AttendanceDay | null {
	const upper = day.trim().toUpperCase();
	if ((ATTENDANCE_DAYS as readonly string[]).includes(upper)) {
		return upper as AttendanceDay;
	}
	const map: Record<string, AttendanceDay> = {
		MONDAY: "SENIN",
		TUESDAY: "SELASA",
		WEDNESDAY: "RABU",
		THURSDAY: "KAMIS",
		FRIDAY: "JUMAT",
		SATURDAY: "SABTU",
		SUNDAY: "MINGGU",
	};
	return map[upper] ?? null;
}

export const AttendanceScheduleDialog: React.FC<
	AttendanceScheduleDialogProps
> = ({
	open,
	editingItem,
	academicYears,
	classes,
	schedules,
	defaultAcademicYearId,
	isSubmitting = false,
	onOpenChange,
	onSubmit,
}) => {
	const activeYearId = useMemo(
		() =>
			defaultAcademicYearId ||
			academicYears.find((y) => y.is_active)?.id ||
			academicYears[0]?.id ||
			"",
		[defaultAcademicYearId, academicYears],
	);

	const form = useForm<AttendanceScheduleFormValues>({
		resolver: zodResolver(attendanceScheduleFormSchema),
		defaultValues: {
			academicYearId: activeYearId,
			classId: "",
			scheduleType: "STANDALONE",
			scheduleId: null,
			title: "",
			activeDays: ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"],
			specificDate: "",
			startTime: "",
			endTime: "",
			isActive: true,
			notes: "",
		},
	});

	const watchedAcademicYearId = form.watch("academicYearId");
	const watchedClassId = form.watch("classId");
	const watchedScheduleType = form.watch("scheduleType");
	const watchedScheduleId = form.watch("scheduleId");
	const watchedActiveDays = form.watch("activeDays");
	const watchedIsActive = form.watch("isActive");

	useEffect(() => {
		if (!open) return;
		if (editingItem) {
			form.reset({
				academicYearId: editingItem.academicYearId,
				classId: editingItem.classId,
				scheduleType: editingItem.scheduleType,
				scheduleId: editingItem.scheduleId,
				title: editingItem.title,
				activeDays: editingItem.activeDays,
				specificDate: editingItem.specificDate
					? editingItem.specificDate.slice(0, 10)
					: "",
				startTime: formatTimeHHmm(editingItem.startTime),
				endTime: formatTimeHHmm(editingItem.endTime),
				isActive: editingItem.isActive,
				notes: editingItem.notes ?? "",
			});
		} else {
			const firstClassForYear = classes.find(
				(c) => !activeYearId || c.academic_year_id === activeYearId,
			);
			form.reset({
				academicYearId: activeYearId,
				classId: firstClassForYear?.id ?? "",
				scheduleType: "STANDALONE",
				scheduleId: null,
				title: "",
				activeDays: ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"],
				specificDate: "",
				startTime: "",
				endTime: "",
				isActive: true,
				notes: "",
			});
		}
	}, [open, editingItem, activeYearId, classes, form]);

	const filteredClasses = useMemo(() => {
		if (!watchedAcademicYearId) return classes;
		return classes.filter((c) => c.academic_year_id === watchedAcademicYearId);
	}, [classes, watchedAcademicYearId]);

	const filteredSchedules = useMemo(() => {
		if (!watchedClassId) return schedules;
		return schedules.filter(
			(s) =>
				s.classSubject?.classId === watchedClassId ||
				s.classSubject?.class?.id === watchedClassId,
		);
	}, [schedules, watchedClassId]);

	const handleSelectSchedule = (scheduleId: string) => {
		form.setValue("scheduleId", scheduleId || null, { shouldValidate: true });
		const found = schedules.find((s) => s.id === scheduleId);
		if (!found) return;

		const subjectName = found.classSubject?.subject?.name;
		const roomName = found.classroom?.roomName;
		const autoTitle = subjectName
			? `${subjectName}${roomName ? ` (${roomName})` : ""}`
			: `Jadwal ${found.day}`;
		form.setValue("title", autoTitle, { shouldValidate: true });

		const mappedDay = mapDayStringToEnum(found.day);
		if (mappedDay) {
			form.setValue("activeDays", [mappedDay], { shouldValidate: true });
		}
		const start = formatTimeHHmm(found.startTime);
		const end = formatTimeHHmm(found.endTime);
		if (start) form.setValue("startTime", start, { shouldValidate: true });
		if (end) form.setValue("endTime", end, { shouldValidate: true });
	};

	const toggleDay = (day: AttendanceDay) => {
		const set = new Set(watchedActiveDays);
		if (set.has(day)) {
			set.delete(day);
		} else {
			set.add(day);
		}
		const ordered = ATTENDANCE_DAYS.filter((d) => set.has(d));
		form.setValue("activeDays", ordered, { shouldValidate: true });
	};

	const handleFormSubmit = form.handleSubmit(async (values) => {
		await onSubmit({
			academicYearId: values.academicYearId,
			classId: values.classId,
			scheduleType: values.scheduleType,
			scheduleId:
				values.scheduleType === "FROM_SCHEDULE"
					? (values.scheduleId ?? null)
					: null,
			title: values.title.trim(),
			activeDays: values.activeDays,
			specificDate: values.specificDate?.trim()
				? values.specificDate.trim()
				: null,
			startTime: values.startTime?.trim() ? values.startTime.trim() : null,
			endTime: values.endTime?.trim() ? values.endTime.trim() : null,
			isActive: values.isActive,
			notes: values.notes?.trim() ? values.notes.trim() : null,
		});
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl dark:bg-[#111927] dark:border-slate-800">
				<DialogHeader>
					<DialogTitle>
						{editingItem ? "Edit Jadwal Absensi" : "Tambah Jadwal Absensi Baru"}
					</DialogTitle>
					<DialogDescription>
						Pilih sumber jadwal dari jadwal pelajaran yang sudah ada atau buat
						sesi absensi mandiri.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleFormSubmit} className="space-y-4">
					{/* Mode Switcher */}
					<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
						<button
							type="button"
							onClick={() => {
								form.setValue("scheduleType", "FROM_SCHEDULE", {
									shouldValidate: true,
								});
							}}
							className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
								watchedScheduleType === "FROM_SCHEDULE"
									? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40"
									: "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-[#0B1220] dark:hover:border-slate-700"
							}`}
						>
							<BookOpen className="mt-0.5 size-4 shrink-0 text-blue-500" />
							<div>
								<p className="text-xs font-bold text-slate-900 dark:text-white">
									Tarik dari Jadwal Pelajaran
								</p>
								<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
									Otomatis isi judul, hari &amp; jam dari mata pelajaran.
								</p>
							</div>
						</button>

						<button
							type="button"
							onClick={() => {
								form.setValue("scheduleType", "STANDALONE", {
									shouldValidate: true,
								});
								form.setValue("scheduleId", null);
							}}
							className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
								watchedScheduleType === "STANDALONE"
									? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/40"
									: "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-[#0B1220] dark:hover:border-slate-700"
							}`}
						>
							<Sparkles className="mt-0.5 size-4 shrink-0 text-purple-500" />
							<div>
								<p className="text-xs font-bold text-slate-900 dark:text-white">
									Sesi Mandiri
								</p>
								<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
									Absensi harian wali kelas atau jadwal pengganti.
								</p>
							</div>
						</button>
					</div>

					{/* Tahun Ajaran & Kelas */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div>
							<Label htmlFor="dialog-academic-year">Tahun Ajaran</Label>
							<Select
								id="dialog-academic-year"
								value={watchedAcademicYearId}
								onChange={(e) => {
									const val = e.target.value;
									form.setValue("academicYearId", val, {
										shouldValidate: true,
									});
									const firstInYear = classes.find(
										(c) => c.academic_year_id === val,
									);
									form.setValue("classId", firstInYear?.id ?? "", {
										shouldValidate: true,
									});
									form.setValue("scheduleId", null);
								}}
								className="mt-1.5 dark:bg-[#0B1220] dark:border-slate-700 dark:text-slate-100"
							>
								<option value="">Pilih Tahun Ajaran</option>
								{academicYears.map((ay) => (
									<option key={ay.id} value={ay.id}>
										{ay.academic_year} {ay.is_active ? "(Aktif)" : ""}
									</option>
								))}
							</Select>
							{form.formState.errors.academicYearId && (
								<p className="mt-1 text-xs text-rose-500">
									{form.formState.errors.academicYearId.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="dialog-class">Kelas</Label>
							<Select
								id="dialog-class"
								value={watchedClassId}
								onChange={(e) => {
									form.setValue("classId", e.target.value, {
										shouldValidate: true,
									});
									form.setValue("scheduleId", null);
								}}
								className="mt-1.5 dark:bg-[#0B1220] dark:border-slate-700 dark:text-slate-100"
							>
								<option value="">Pilih Kelas</option>
								{filteredClasses.map((cls) => (
									<option key={cls.id} value={cls.id}>
										{cls.name}
									</option>
								))}
							</Select>
							{form.formState.errors.classId && (
								<p className="mt-1 text-xs text-rose-500">
									{form.formState.errors.classId.message}
								</p>
							)}
						</div>
					</div>

					{/* Jadwal Pelajaran Selector when FROM_SCHEDULE */}
					{watchedScheduleType === "FROM_SCHEDULE" && (
						<div>
							<Label htmlFor="dialog-schedule-select">
								Pilih Jadwal Pelajaran
							</Label>
							<Select
								id="dialog-schedule-select"
								value={watchedScheduleId ?? ""}
								onChange={(e) => handleSelectSchedule(e.target.value)}
								className="mt-1.5 dark:bg-[#0B1220] dark:border-slate-700 dark:text-slate-100"
							>
								<option value="">Pilih jadwal pelajaran kelas ini...</option>
								{filteredSchedules.map((s) => {
									const subj = s.classSubject?.subject?.name ?? "Mapel";
									const start = formatTimeHHmm(s.startTime);
									const end = formatTimeHHmm(s.endTime);
									const timeStr = start && end ? ` (${start}-${end})` : "";
									return (
										<option key={s.id} value={s.id}>
											{subj} • {s.day}
											{timeStr}
										</option>
									);
								})}
							</Select>
							{form.formState.errors.scheduleId && (
								<p className="mt-1 text-xs text-rose-500">
									{form.formState.errors.scheduleId.message}
								</p>
							)}
						</div>
					)}

					{/* Title */}
					<div>
						<Label htmlFor="dialog-title">Nama Jadwal Absensi</Label>
						<Input
							id="dialog-title"
							placeholder="Contoh: Absensi Harian Kelas 1A"
							className="mt-1.5 dark:bg-[#0B1220] dark:border-slate-700"
							{...form.register("title")}
						/>
						{form.formState.errors.title && (
							<p className="mt-1 text-xs text-rose-500">
								{form.formState.errors.title.message}
							</p>
						)}
					</div>

					{/* Active Days Picker */}
					<div>
						<div className="flex flex-wrap items-center justify-between gap-2">
							<Label>Hari Aktif</Label>
							<div className="flex gap-1.5">
								<button
									type="button"
									onClick={() =>
										form.setValue(
											"activeDays",
											["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"],
											{ shouldValidate: true },
										)
									}
									className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
								>
									Pilih Sen–Jum
								</button>
								<button
									type="button"
									onClick={() =>
										form.setValue(
											"activeDays",
											["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"],
											{ shouldValidate: true },
										)
									}
									className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
								>
									Pilih Sen–Sab
								</button>
							</div>
						</div>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{ATTENDANCE_DAYS.map((day) => {
								const selected = watchedActiveDays.includes(day);
								return (
									<button
										key={day}
										type="button"
										aria-pressed={selected}
										onClick={() => toggleDay(day)}
										className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
											selected
												? "bg-blue-600 text-white shadow-xs hover:bg-blue-500"
												: "border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0B1220] dark:text-slate-400"
										}`}
									>
										{ATTENDANCE_DAY_LABELS[day]}
									</button>
								);
							})}
						</div>
					</div>

					{/* Specific Date, Start Time, End Time */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div>
							<Label htmlFor="dialog-specific-date">
								Tanggal Spesifik (Opsional)
							</Label>
							<Input
								id="dialog-specific-date"
								type="date"
								className="mt-1.5 dark:bg-[#0B1220] dark:border-slate-700"
								{...form.register("specificDate")}
							/>
						</div>

						<div>
							<Label htmlFor="dialog-start-time">Jam Mulai</Label>
							<Input
								id="dialog-start-time"
								type="time"
								className="mt-1.5 dark:bg-[#0B1220] dark:border-slate-700"
								{...form.register("startTime")}
							/>
							{form.formState.errors.startTime && (
								<p className="mt-1 text-xs text-rose-500">
									{form.formState.errors.startTime.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="dialog-end-time">Jam Selesai</Label>
							<Input
								id="dialog-end-time"
								type="time"
								className="mt-1.5 dark:bg-[#0B1220] dark:border-slate-700"
								{...form.register("endTime")}
							/>
							{form.formState.errors.endTime && (
								<p className="mt-1 text-xs text-rose-500">
									{form.formState.errors.endTime.message}
								</p>
							)}
						</div>
					</div>

					{/* Status Toggle & Notes */}
					<div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800 dark:bg-[#0B1220]">
						<div>
							<p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
								Langsung Aktifkan Jadwal
							</p>
							<p className="text-[11px] text-slate-500 dark:text-slate-400">
								Jadwal aktif akan langsung tersedia untuk pencatatan presensi.
							</p>
						</div>
						<Switch
							checked={watchedIsActive}
							onCheckedChange={(checked) =>
								form.setValue("isActive", checked, { shouldValidate: true })
							}
						/>
					</div>

					<div>
						<Label htmlFor="dialog-notes">Catatan (Opsional)</Label>
						<textarea
							id="dialog-notes"
							rows={2}
							placeholder="Catatan tambahan untuk guru atau admin..."
							className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#0B1220] dark:text-slate-100"
							{...form.register("notes")}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-blue-600 text-white hover:bg-blue-500"
						>
							{isSubmitting
								? "Menyimpan..."
								: editingItem
									? "Simpan Perubahan"
									: "Simpan Jadwal"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
