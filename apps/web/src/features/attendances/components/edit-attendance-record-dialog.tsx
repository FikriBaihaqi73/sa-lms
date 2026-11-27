import { Calendar, Check, Clock, GraduationCap, User, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AttendanceStatusIcon } from "@/features/attendance-statuses/components/attendance-status-icon";
import type { Attendance, AttendanceStatusOption } from "../types";

interface EditAttendanceRecordDialogProps {
	isOpen: boolean;
	onClose: () => void;
	record: Attendance | null;
	statusOptions: AttendanceStatusOption[];
	isSubmitting?: boolean;
	onSave: (id: string, statusId: string, notes: string | null) => Promise<void>;
}

function formatReadableDate(dateStr: string | null | undefined): string {
	if (!dateStr) return "-";
	const clean = dateStr.split("T")[0];
	const parsed = new Date(`${clean}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return dateStr;
	return new Intl.DateTimeFormat("id-ID", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(parsed);
}

export const EditAttendanceRecordDialog: React.FC<
	EditAttendanceRecordDialogProps
> = ({
	isOpen,
	onClose,
	record,
	statusOptions,
	isSubmitting = false,
	onSave,
}) => {
	const [selectedStatusId, setSelectedStatusId] = useState("");
	const [notes, setNotes] = useState("");

	useEffect(() => {
		if (isOpen && record) {
			setSelectedStatusId(
				record.attendance_status_id || statusOptions[0]?.id || "",
			);
			setNotes(record.notes ?? "");
		}
	}, [isOpen, record, statusOptions]);

	if (!record) return null;

	const studentName = record.student?.profile?.fullName || "Siswa";
	const studentNumber = record.student?.studentNumber || "-";
	const className =
		record.attendance_schedule?.class?.name ||
		record.schedule?.classSubject?.class?.name ||
		"-";
	const scheduleTitle =
		record.attendance_schedule?.title ||
		record.schedule?.classSubject?.subject?.name ||
		"-";
	const formattedDate = formatReadableDate(record.attendance_date);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStatusId) return;
		await onSave(record.id, selectedStatusId, notes.trim() || null);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="border-slate-200 bg-white text-slate-900 sm:max-w-md dark:border-slate-800 dark:bg-[#0f172a] dark:text-slate-100">
				<DialogHeader>
					<DialogTitle className="text-base font-bold">
						Ubah Status & Catatan Presensi
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						Perbarui status kehadiran dan catatan untuk sesi presensi berikut.
					</DialogDescription>
				</DialogHeader>

				{/* Read-Only Session Summary */}
				<div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-2 dark:border-slate-800 dark:bg-[#0b1120]">
					<div className="flex items-start gap-2">
						<User className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
						<div className="min-w-0">
							<p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
								Siswa
							</p>
							<p className="truncate font-semibold text-slate-800 dark:text-slate-100">
								{studentName}
							</p>
							<p className="text-[11px] text-slate-500">{studentNumber}</p>
						</div>
					</div>

					<div className="flex items-start gap-2">
						<GraduationCap className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
						<div className="min-w-0">
							<p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
								Kelas
							</p>
							<p className="truncate font-semibold text-slate-800 dark:text-slate-100">
								{className}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-2">
						<Calendar className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
						<div className="min-w-0">
							<p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
								Tanggal
							</p>
							<p className="truncate font-semibold text-slate-800 dark:text-slate-100">
								{formattedDate}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-2">
						<Clock className="mt-0.5 size-3.5 shrink-0 text-purple-500" />
						<div className="min-w-0">
							<p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
								Jadwal Absensi
							</p>
							<p className="truncate font-semibold text-slate-800 dark:text-slate-100">
								{scheduleTitle}
							</p>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Status Kehadiran
						</p>
						<div className="grid grid-cols-2 gap-2">
							{statusOptions.map((st) => {
								const isSelected = selectedStatusId === st.id;
								const colorHex = st.color || "#2563EB";
								return (
									<button
										key={st.id}
										type="button"
										onClick={() => setSelectedStatusId(st.id)}
										className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
											isSelected
												? "shadow-sm ring-1"
												: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111927] dark:text-slate-300 dark:hover:bg-slate-800/70"
										}`}
										style={
											isSelected
												? {
														borderColor: colorHex,
														backgroundColor: `${colorHex}18`,
														color: colorHex,
													}
												: undefined
										}
									>
										<span className="flex items-center gap-2 truncate">
											<AttendanceStatusIcon
												icon={st.icon}
												className="size-3.5 shrink-0"
											/>
											<span className="truncate">{st.name}</span>
										</span>
										{isSelected && <Check className="size-3.5 shrink-0" />}
									</button>
								);
							})}
						</div>
					</div>

					<div>
						<label
							htmlFor="edit-attendance-notes"
							className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
						>
							Catatan (Opsional)
						</label>
						<textarea
							id="edit-attendance-notes"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Tambahkan keterangan izin, sakit, atau catatan guru..."
							className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700/70 dark:bg-[#0b1120] dark:text-slate-100 dark:placeholder:text-slate-500"
						/>
					</div>

					<div className="flex items-center justify-end gap-2 pt-1">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
						>
							<X className="size-3.5" />
							<span>Batal</span>
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !selectedStatusId}
							className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
						>
							<Check className="size-3.5" />
							<span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
