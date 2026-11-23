import { ShieldCheck } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type {
	ExaminationOption,
	ExaminationScoreItem,
	StandardGrade,
	StudentParticipant,
} from "../types";
import {
	formatDateTime,
	formatScore,
	resolveGradeFromScore,
} from "../utils/grade-resolver";

interface ExaminationScoreAuditDialogProps {
	open: boolean;
	onClose: () => void;
	scoreItem: ExaminationScoreItem | null;
	student: StudentParticipant | null;
	examination: ExaminationOption | null;
	grades: StandardGrade[];
}

export const ExaminationScoreAuditDialog: React.FC<
	ExaminationScoreAuditDialogProps
> = ({ open, onClose, scoreItem, student, examination, grades }) => {
	if (!scoreItem) return null;

	const gradeResult = resolveGradeFromScore(scoreItem.score, grades);
	const graderName =
		scoreItem.grader?.profile?.fullName ||
		scoreItem.grader?.email ||
		"Sistem / Guru Pengampu";

	return (
		<Dialog open={open} onOpenChange={(val) => !val && onClose()}>
			<DialogContent className="max-w-md border-slate-200 bg-white sm:rounded-2xl dark:border-slate-800 dark:bg-[#111927]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
							<ShieldCheck className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
								Audit Metadata Penilaian
							</DialogTitle>
							<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
								Informasi jejak audit penginputan dan verifikasi nilai ujian
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="mt-2 space-y-3.5 text-xs">
					{/* Siswa & Mata Ujian */}
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0c1322]">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									PESERTA
								</p>
								<p className="mt-0.5 font-bold text-slate-900 dark:text-white">
									{student?.fullName ?? "Siswa"}
								</p>
								<p className="text-[11px] text-slate-500">
									NIS: {student?.studentNumber ?? "-"}
								</p>
							</div>
							<div className="text-right">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									NILAI AKHIR
								</p>
								<p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
									{formatScore(scoreItem.score)}
								</p>
								<span
									className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${gradeResult.colorBadge.bg} ${gradeResult.colorBadge.text} ${gradeResult.colorBadge.border}`}
								>
									{gradeResult.grade}
								</span>
							</div>
						</div>
					</div>

					{/* Metadata Audit Grid */}
					<div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800/80 dark:bg-[#111927]">
						<div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
							<span className="text-slate-500 dark:text-slate-400">
								Record ID
							</span>
							<span className="font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200">
								{scoreItem.id}
							</span>
						</div>

						<div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
							<span className="text-slate-500 dark:text-slate-400">
								Mata Ujian
							</span>
							<span className="font-medium text-slate-800 dark:text-slate-200">
								{examination?.title ?? "-"}
							</span>
						</div>

						<div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
							<span className="text-slate-500 dark:text-slate-400">
								Penilai (Graded By)
							</span>
							<span className="font-semibold text-slate-900 dark:text-white">
								{graderName}
							</span>
						</div>

						<div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
							<span className="text-slate-500 dark:text-slate-400">
								Waktu Penilaian
							</span>
							<span className="font-medium text-slate-700 dark:text-slate-300">
								{formatDateTime(scoreItem.gradedAt)}
							</span>
						</div>

						<div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
							<span className="text-slate-500 dark:text-slate-400">
								Dibuat Pada
							</span>
							<span className="text-slate-700 dark:text-slate-300">
								{formatDateTime(scoreItem.createdAt)}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-slate-500 dark:text-slate-400">
								Terakhir Diperbarui
							</span>
							<span className="text-slate-700 dark:text-slate-300">
								{formatDateTime(scoreItem.updatedAt)}
							</span>
						</div>
					</div>

					{/* Catatan Penguji */}
					<div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-[#0c1322]/80">
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
							CATATAN PENGUJI / EVALUASI
						</p>
						<p className="mt-1 text-slate-700 dark:text-slate-300">
							{scoreItem.notes ? (
								scoreItem.notes
							) : (
								<span className="italic text-slate-400">
									Tidak ada catatan evaluasi.
								</span>
							)}
						</p>
					</div>
				</div>

				<DialogFooter className="pt-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onClose}
						className="w-full rounded-xl text-xs sm:w-auto"
					>
						Tutup
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
