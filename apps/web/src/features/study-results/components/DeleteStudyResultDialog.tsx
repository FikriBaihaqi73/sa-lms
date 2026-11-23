import { AlertTriangle } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { StudyResult } from "../types";

interface DeleteStudyResultDialogProps {
	open: boolean;
	result: StudyResult | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

export const DeleteStudyResultDialog: React.FC<
	DeleteStudyResultDialogProps
> = ({ open, result, isDeleting, onClose, onConfirm }) => {
	if (!open || !result) return null;

	const studentName =
		result.student?.profile?.fullName ||
		`NIS: ${result.student?.studentNumber}`;
	const period = `${result.academicYear?.academic_year || "Tahun Ajaran"} - ${
		result.semester?.name || "Semester"
	}`;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-dialog-title"
		>
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
				<div className="flex items-center gap-3 text-red-600 dark:text-red-400">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/60">
						<AlertTriangle className="size-5" />
					</div>
					<h2
						id="delete-dialog-title"
						className="text-base font-bold text-slate-900 dark:text-slate-100"
					>
						Hapus Rekap Nilai Siswa
					</h2>
				</div>

				<p className="mt-3 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
					Apakah Anda yakin ingin menghapus data rekap nilai untuk{" "}
					<strong className="text-slate-900 dark:text-slate-100">
						{studentName}
					</strong>{" "}
					pada periode <span className="font-semibold">{period}</span>? Tindakan
					ini dapat dipulihkan melalui log sistem.
				</p>

				<div className="mt-6 flex items-center justify-end gap-2.5">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
						className="h-9 px-4 text-xs font-semibold"
					>
						Batal
					</Button>
					<Button
						type="button"
						onClick={onConfirm}
						disabled={isDeleting}
						className="h-9 px-4 text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
					>
						{isDeleting ? "Menghapus..." : "Ya, Hapus"}
					</Button>
				</div>
			</div>
		</div>
	);
};
