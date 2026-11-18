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
	assignmentTitle?: string;
	onClose: () => void;
}

const statusLabels: Record<SubmissionRow["status"], string> = {
	submitted: "Sudah Mengumpulkan",
	late: "Terlambat",
	missing: "Belum Mengumpulkan",
};

export const AssignmentSubmissionDetailDialog: React.FC<
	AssignmentSubmissionDetailDialogProps
> = ({ selected, assignmentTitle, onClose }) => {
	return (
		<Dialog
			open={Boolean(selected)}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto border-slate-700 bg-[#0c1427] text-slate-100 sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-white">
						Detail Pengumpulan
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-400">
						{selected?.fullName} · {assignmentTitle ?? "Tugas"}
					</DialogDescription>
				</DialogHeader>

				{selected && (
					<dl className="space-y-4 border-t border-slate-700/80 pt-4 text-sm">
						<div>
							<dt className="text-xs font-medium text-slate-400">Status</dt>
							<dd className="mt-1 font-semibold text-white">
								{statusLabels[selected.status]}
							</dd>
						</div>
						<div>
							<dt className="text-xs font-medium text-slate-400">
								Waktu Pengumpulan (WIB)
							</dt>
							<dd className="mt-1 text-slate-200">
								{submissionDate(selected.submittedAt)}
							</dd>
						</div>
						<div>
							<dt className="text-xs font-medium text-slate-400">Nilai</dt>
							<dd className="mt-1 font-semibold text-white">
								{selected.score ?? "—"}
							</dd>
						</div>
						<div>
							<dt className="text-xs font-medium text-slate-400">Feedback</dt>
							<dd className="mt-1 whitespace-pre-wrap break-words text-slate-200">
								{selected.feedback ?? "—"}
							</dd>
						</div>
						<div>
							<dt className="text-xs font-medium text-slate-400">Penilai</dt>
							<dd className="mt-1 text-slate-200">
								{selected.graderName ?? "—"}
							</dd>
						</div>
						<div>
							<dt className="text-xs font-medium text-slate-400">
								Waktu Penilaian (WIB)
							</dt>
							<dd className="mt-1 text-slate-200">
								{submissionDate(selected.gradedAt)}
							</dd>
						</div>
					</dl>
				)}

				<div className="mt-4 flex justify-end">
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
						onClick={onClose}
					>
						Tutup
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
