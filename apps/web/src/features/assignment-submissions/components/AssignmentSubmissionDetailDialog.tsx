import { FileText } from "lucide-react";
import type React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { SubmissionRow } from "../types";
import { submissionDate } from "../utils";

interface AssignmentSubmissionDetailDialogProps {
	selected: SubmissionRow | null;
	onClose: () => void;
}

export const AssignmentSubmissionDetailDialog: React.FC<
	AssignmentSubmissionDetailDialogProps
> = ({ selected, onClose }) => {
	return (
		<Dialog
			open={Boolean(selected)}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111927] dark:text-slate-100 sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
						Detail Hasil Tugas Siswa
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						{selected?.fullName} ({selected?.className || "Kelas"}) ·{" "}
						{selected?.subjectName || "Mata Pelajaran"}
					</DialogDescription>
				</DialogHeader>

				{selected && (
					<dl className="space-y-3 border-t border-slate-200 pt-3 text-xs dark:border-slate-800/80">
						<div>
							<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
								Judul Tugas
							</dt>
							<dd className="mt-1 font-semibold text-slate-900 dark:text-white">
								{selected.assignmentTitle || "—"}
							</dd>
						</div>

						<div>
							<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
								Berkas Hasil Tugas
							</dt>
							<dd className="mt-1.5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
								<FileText className="size-4 shrink-0" />
								<span>{selected.fileName || "Tidak ada berkas terlampir"}</span>
							</dd>
						</div>

						<div>
							<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
								Jawaban / Catatan Pengiriman Siswa
							</dt>
							<dd className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-200">
								{selected.answerText || "Tidak ada catatan jawaban tambahan."}
							</dd>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
									Waktu Pengumpulan (WIB)
								</dt>
								<dd className="mt-1 text-xs text-slate-700 dark:text-slate-200">
									{submissionDate(selected.submittedAt)}
								</dd>
							</div>
							<div>
								<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
									Nilai
								</dt>
								<dd className="mt-1 font-semibold text-slate-900 dark:text-white">
									{selected.score !== null && selected.score !== undefined
										? `${selected.score} / ${selected.maxScore ?? 100}`
										: "Menunggu Penilaian"}
								</dd>
							</div>
						</div>

						<div>
							<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
								Feedback Guru
							</dt>
							<dd className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-700 dark:text-slate-200">
								{selected.feedback ?? "—"}
							</dd>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
									Penilai
								</dt>
								<dd className="mt-1 text-xs text-slate-700 dark:text-slate-200">
									{selected.graderName ?? "—"}
								</dd>
							</div>
							<div>
								<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
									Waktu Penilaian (WIB)
								</dt>
								<dd className="mt-1 text-xs text-slate-700 dark:text-slate-200">
									{submissionDate(selected.gradedAt)}
								</dd>
							</div>
						</div>
					</dl>
				)}

				<div className="mt-3 flex justify-end">
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
						onClick={onClose}
					>
						Tutup
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
