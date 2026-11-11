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
			<DialogContent className="max-w-md border-slate-800 bg-[#111927] p-6 text-slate-100 shadow-2xl">
				<DialogHeader className="text-left">
					<div className="flex size-11 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-400">
						<AlertTriangle className="size-5" />
					</div>
					<DialogTitle className="mt-3 text-base font-semibold text-white">
						Konfirmasi Drop / Hapus Rencana Studi
					</DialogTitle>
					<DialogDescription className="mt-1 text-xs text-slate-400">
						Tindakan ini akan membatalkan pendaftaran siswa pada mata pelajaran
						kelas ini dan mengurangi total beban SKS siswa tersebut.
					</DialogDescription>
				</DialogHeader>

				{/* Info Card */}
				<div className="mt-3 rounded-lg border border-slate-800 bg-[#0c1322] p-3 text-xs">
					<p className="text-slate-400">
						Siswa: <strong className="text-white">{studentName}</strong>
					</p>
					<p className="mt-1 text-slate-400">
						Mata Pelajaran:{" "}
						<strong className="text-blue-300">{subjectName}</strong> ({credits}{" "}
						SKS)
					</p>
					<p className="mt-1 text-slate-400">
						Kelas: <strong className="text-slate-200">{className}</strong>
					</p>
				</div>

				<div className="mt-5 flex items-center justify-end gap-2.5">
					<button
						type="button"
						onClick={onClose}
						disabled={isDeleting}
						className="rounded-lg border border-slate-700/60 bg-transparent px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
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
