import { AlertTriangle, Trash2 } from "lucide-react";
import type React from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AssignmentItem } from "../types";

interface DeleteAssignmentDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	assignment?: AssignmentItem | null;
	isDeleting?: boolean;
}

export const DeleteAssignmentDialog: React.FC<DeleteAssignmentDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	assignment,
	isDeleting = false,
}) => {
	if (!assignment) return null;

	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<AlertDialogContent className="max-w-md border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111927] dark:text-slate-100">
				<AlertDialogHeader>
					<div className="mx-auto flex size-12 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400">
						<AlertTriangle className="size-6" />
					</div>
					<AlertDialogTitle className="text-center text-lg font-bold text-slate-900 dark:text-white">
						Hapus Penugasan Ini?
					</AlertDialogTitle>
					<AlertDialogDescription className="text-center text-xs text-slate-500 dark:text-slate-400">
						Apakah Anda yakin ingin menghapus tugas{" "}
						<strong className="text-slate-900 dark:text-white">
							"{assignment.title}"
						</strong>
						? Seluruh data submisi terkait tugas ini akan diarsipkan
						(soft-deleted).
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="mt-4 flex items-center justify-center gap-3">
					<AlertDialogCancel
						onClick={onClose}
						disabled={isDeleting}
						className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
					>
						Batal
					</AlertDialogCancel>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isDeleting}
						className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-500 disabled:opacity-50"
					>
						<Trash2 className="size-3.5" />
						<span>{isDeleting ? "Menghapus..." : "Ya, Hapus Tugas"}</span>
					</button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
