import { Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	ATTENDANCE_DAY_SHORT_LABELS,
	ATTENDANCE_DAYS,
} from "../schemas/attendanceScheduleSchema";
import type { AttendanceDay, AttendanceScheduleItem } from "../types";

interface AttendanceSchedulesTableProps {
	rows: AttendanceScheduleItem[];
	isLoading?: boolean;
	updatingId?: string | null;
	onToggleDay: (
		item: AttendanceScheduleItem,
		nextDays: AttendanceDay[],
	) => void;
	onToggleStatus: (item: AttendanceScheduleItem, isActive: boolean) => void;
	onEdit: (item: AttendanceScheduleItem) => void;
	onDelete: (item: AttendanceScheduleItem) => void;
}

export function formatTimeHHmm(value: string | null | undefined): string {
	if (!value) return "";
	if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	const hh = String(d.getUTCHours()).padStart(2, "0");
	const mm = String(d.getUTCMinutes()).padStart(2, "0");
	return `${hh}:${mm}`;
}

function formatDateDisplay(value: string | null | undefined): string {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return value;
	return d.toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
}

export const AttendanceSchedulesTable: React.FC<
	AttendanceSchedulesTableProps
> = ({
	rows,
	isLoading = false,
	updatingId = null,
	onToggleDay,
	onToggleStatus,
	onEdit,
	onDelete,
}) => {
	if (isLoading) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800/90 dark:bg-[#111927] dark:text-slate-400">
				Memuat daftar jadwal absensi...
			</div>
		);
	}

	if (rows.length === 0) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				<Calendar className="mx-auto mb-3 size-10 text-slate-300 dark:text-slate-600" />
				<p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
					Belum ada jadwal absensi
				</p>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Tambahkan jadwal absensi baru dari jadwal pelajaran atau sebagai sesi
					mandiri.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-xs">
					<thead>
						<tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-[#0d1526] dark:text-slate-400">
							<th className="px-4 py-3.5">Nama Jadwal & Kelas</th>
							<th className="px-4 py-3.5">Jam / Waktu</th>
							<th className="px-4 py-3.5">Hari Aktif (Klik untuk ubah)</th>
							<th className="px-4 py-3.5 text-center">Status</th>
							<th className="px-4 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
						{rows.map((row) => {
							const start = formatTimeHHmm(row.startTime);
							const end = formatTimeHHmm(row.endTime);
							const isRowUpdating = updatingId === row.id;
							const subjectName = row.schedule?.classSubject?.subject?.name;

							return (
								<tr
									key={row.id}
									className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
								>
									{/* Nama Jadwal & Kelas */}
									<td className="px-4 py-3.5 align-top">
										<div className="flex flex-col gap-1">
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-sm font-semibold text-slate-900 dark:text-white">
													{row.title}
												</span>
												{row.scheduleType === "FROM_SCHEDULE" ? (
													<Badge className="bg-blue-500/15 text-blue-700 border border-blue-500/30 hover:bg-blue-500/20 dark:text-blue-300">
														Dari Jadwal
													</Badge>
												) : (
													<Badge className="bg-purple-500/15 text-purple-700 border border-purple-500/30 hover:bg-purple-500/20 dark:text-purple-300">
														Sesi Mandiri
													</Badge>
												)}
											</div>
											<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
												<span className="font-medium text-slate-700 dark:text-slate-300">
													{row.class?.name ?? "-"}
												</span>
												{row.academicYear?.academic_year && (
													<span>• {row.academicYear.academic_year}</span>
												)}
												{subjectName && <span>• {subjectName}</span>}
											</div>
										</div>
									</td>

									{/* Jam / Waktu */}
									<td className="px-4 py-3.5 align-top whitespace-nowrap">
										<div className="flex flex-col gap-1">
											<span className="inline-flex items-center gap-1.5 font-medium tabular-nums text-slate-700 dark:text-slate-200">
												<Clock className="size-3.5 text-slate-400" />
												{start && end
													? `${start} – ${end}`
													: start || end || "Fleksibel"}
											</span>
											{row.specificDate && (
												<span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
													<Calendar className="size-3" />
													{formatDateDisplay(row.specificDate)}
												</span>
											)}
										</div>
									</td>

									{/* Hari Aktif (Interaktif) */}
									<td className="px-4 py-3.5 align-top">
										<div className="flex flex-wrap gap-1">
											{ATTENDANCE_DAYS.map((day) => {
												const isDayActive = row.activeDays.includes(day);
												return (
													<button
														key={day}
														type="button"
														disabled={isRowUpdating}
														aria-pressed={isDayActive}
														aria-label={`${ATTENDANCE_DAY_SHORT_LABELS[day]} untuk ${row.title}`}
														onClick={() => {
															const nextSet = new Set(row.activeDays);
															if (isDayActive) {
																nextSet.delete(day);
															} else {
																nextSet.add(day);
															}
															const nextDays = ATTENDANCE_DAYS.filter((d) =>
																nextSet.has(d),
															);
															onToggleDay(row, nextDays);
														}}
														className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
															isDayActive
																? "bg-blue-600 text-white shadow-xs hover:bg-blue-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
																: "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800/80 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
														} ${isRowUpdating ? "opacity-60 cursor-wait" : ""}`}
													>
														{ATTENDANCE_DAY_SHORT_LABELS[day]}
													</button>
												);
											})}
										</div>
									</td>

									{/* Status Switch */}
									<td className="px-4 py-3.5 align-top text-center">
										<div className="inline-flex items-center gap-2">
											<Switch
												checked={row.isActive}
												disabled={isRowUpdating}
												aria-label={`Status aktif ${row.title}`}
												onCheckedChange={(checked) =>
													onToggleStatus(row, checked)
												}
											/>
											<span
												className={`text-[11px] font-semibold ${
													row.isActive
														? "text-emerald-600 dark:text-emerald-400"
														: "text-slate-400 dark:text-slate-500"
												}`}
											>
												{row.isActive ? "Aktif" : "Nonaktif"}
											</span>
										</div>
									</td>

									{/* Aksi */}
									<td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
										<div className="inline-flex items-center justify-end gap-1.5">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => onEdit(row)}
												className="h-8 px-2.5 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
											>
												<Edit2 className="mr-1 size-3.5" />
												Ubah
											</Button>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => onDelete(row)}
												className="h-8 px-2.5 text-rose-600 dark:border-slate-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
											>
												<Trash2 className="mr-1 size-3.5" />
												Hapus
											</Button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};
