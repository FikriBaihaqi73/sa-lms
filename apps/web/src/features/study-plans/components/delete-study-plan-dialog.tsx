import { AlertTriangle, Trash2 } from "lucide-react";
import type React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { StudyPlan } from "../types";

interface DeleteStudyPlanDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	studyPlan: StudyPlan | null;
	isDeleting?: boolean;
}

export const DeleteStudyPlanDialog: React.FC<DeleteStudyPlanDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	studyPlan,
	isDeleting = false,
}) => {
	if (!studyPlan) return null;

	const studentName =
		studyPlan.student?.profile?.fullName ||
		`Siswa #${studyPlan.student?.studentNumber || "-"}`;
	const subjectName = studyPlan.classSubject?.subject?.name || "Mata Pelajaran";
	const className = studyPlan.classSubject?.class?.name || "Kelas";
	const credits = studyPlan.classSubject?.subject?.credits ?? 0;

	const handleConfirm = async () => {
		await onConfirm();
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-md border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111927] dark:text-slate-100">
				<DialogHeader className="text-left">
					<div className="flex size-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400">
						<AlertTriangle className="size-5" />
					</div>
					<DialogTitle className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
						Konfirmasi Drop / Hapus Rencana Studi
					</DialogTitle>
					<DialogDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
						Tindakan ini akan membatalkan pendaftaran siswa pada mata pelajaran
						kelas ini dan mengurangi total beban SKS siswa tersebut.
					</DialogDescription>
				</DialogHeader>

				{/* Info Card */}
				<div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-[#0c1322]">
					<p className="text-slate-500 dark:text-slate-400">
						Siswa:{" "}
						<strong className="text-slate-900 dark:text-white">
							{studentName}
						</strong>
					</p>
					<p className="mt-1 text-slate-500 dark:text-slate-400">
						Mata Pelajaran:{" "}
						<strong className="text-blue-600 dark:text-blue-300">
							{subjectName}
						</strong>{" "}
						({credits} SKS)
					</p>
					<p className="mt-1 text-slate-500 dark:text-slate-400">
						Kelas:{" "}
						<strong className="text-slate-800 dark:text-slate-200">
							{className}
						</strong>
					</p>
				</div>

				<div className="mt-5 flex items-center justify-end gap-2.5">
					<button
						type="button"
						onClick={onClose}
						disabled={isDeleting}
						className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
					>
						Batal
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						disabled={isDeleting}
						className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-50"
					>
						<Trash2 className="size-3.5" />
						<span>{isDeleting ? "Menghapus..." : "Ya, Hapus / Drop"}</span>
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
