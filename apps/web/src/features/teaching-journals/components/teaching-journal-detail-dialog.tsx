import { BookOpen, Clock, MapPin, User } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ScheduleOption, TeachingJournal } from "../types";

interface TeachingJournalDetailDialogProps {
	isOpen: boolean;
	onClose: () => void;
	journal: TeachingJournal | null;
	scheduleMap?: Record<string, ScheduleOption>;
	onEdit?: (journal: TeachingJournal) => void;
}

function formatDate(dateStr: string | null | undefined): string {
	if (!dateStr) return "—";
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export const TeachingJournalDetailDialog: React.FC<
	TeachingJournalDetailDialogProps
> = ({ isOpen, onClose, journal, scheduleMap = {}, onEdit }) => {
	if (!journal) return null;

	const schOpt = scheduleMap[journal.schedule_id];
	const subjectName =
		journal.schedule?.classSubject?.subject?.name ??
		schOpt?.subjectName ??
		"Mata Pelajaran";
	const className =
		journal.schedule?.classSubject?.class?.name ?? schOpt?.className ?? "Kelas";
	const day = journal.schedule?.day ?? schOpt?.day ?? "—";
	const time =
		journal.schedule?.startTime && journal.schedule?.endTime
			? `${journal.schedule.startTime} - ${journal.schedule.endTime}`
			: schOpt?.timeRange || "";
	const roomName =
		journal.schedule?.classroom?.roomName ?? schOpt?.roomName ?? "";
	const teacherName =
		journal.schedule?.classSubject?.teacher?.profile?.fullName ??
		schOpt?.teacherName ??
		journal.createdBy?.profile?.fullName ??
		journal.createdBy?.name ??
		"—";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="border-blue-800 bg-blue-950/60 font-mono text-xs text-blue-400"
						>
							Pertemuan #{journal.meeting_number ?? "—"}
						</Badge>
						<span className="text-xs text-slate-400">
							{formatDate(journal.journal_date)}
						</span>
					</div>
					<DialogTitle className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
						{journal.topic || "Kegiatan Belajar Mengajar"}
					</DialogTitle>
					<DialogDescription>
						Rincian materi, informasi kelas, dan catatan pelaksanaan
						pembelajaran.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{/* Info Jadwal & Pengampu Box */}
					<div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:grid-cols-2">
						<div className="flex items-start gap-2.5">
							<BookOpen className="mt-0.5 size-4 text-blue-500" />
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Mata Pelajaran & Kelas
								</p>
								<p className="font-semibold text-slate-900 dark:text-slate-100">
									{subjectName}
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Rombel: {className}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2.5">
							<User className="mt-0.5 size-4 text-violet-500" />
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Guru Pengampu / Pencatat
								</p>
								<p className="font-semibold text-slate-900 dark:text-slate-100">
									{teacherName}
								</p>
								{journal.createdBy?.email && (
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{journal.createdBy.email}
									</p>
								)}
							</div>
						</div>

						<div className="flex items-start gap-2.5">
							<Clock className="mt-0.5 size-4 text-amber-500" />
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Waktu Pelaksanaan
								</p>
								<p className="text-sm font-medium text-slate-900 dark:text-slate-100">
									{day} {time ? `• ${time}` : ""}
								</p>
							</div>
						</div>

						{roomName && (
							<div className="flex items-start gap-2.5">
								<MapPin className="mt-0.5 size-4 text-emerald-500" />
								<div>
									<p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
										Ruang Kelas
									</p>
									<p className="text-sm font-medium text-slate-900 dark:text-slate-100">
										{roomName}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Rincian Materi Ajar */}
					<div className="space-y-1.5">
						<h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Rincian Materi Ajar
						</h4>
						<div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
							{journal.material?.trim() ? (
								<p className="whitespace-pre-wrap">{journal.material}</p>
							) : (
								<p className="italic text-slate-400 dark:text-slate-500">
									Tidak ada rincian materi yang dicatat.
								</p>
							)}
						</div>
					</div>

					{/* Catatan & Evaluasi */}
					<div className="space-y-1.5">
						<h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Catatan & Evaluasi Pertemuan
						</h4>
						<div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
							{journal.notes?.trim() ? (
								<p className="whitespace-pre-wrap">{journal.notes}</p>
							) : (
								<p className="italic text-slate-400 dark:text-slate-500">
									Tidak ada catatan evaluasi atau tugas pada pertemuan ini.
								</p>
							)}
						</div>
					</div>

					{/* Metadata ID / Jadwal */}
					<div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
						<span>ID Jurnal: {journal.id}</span>
						<span>ID Jadwal: {journal.schedule_id}</span>
					</div>
				</div>

				<DialogFooter className="mt-4 flex gap-2">
					{onEdit && (
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onClose();
								onEdit(journal);
							}}
						>
							Ubah Jurnal
						</Button>
					)}
					<Button
						type="button"
						onClick={onClose}
						className="bg-blue-600 text-white hover:bg-blue-700"
					>
						Tutup
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
