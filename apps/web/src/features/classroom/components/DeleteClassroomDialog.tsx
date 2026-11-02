import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Classroom } from "../types";

interface DeleteClassroomDialogProps {
	classroom: Classroom | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

export function DeleteClassroomDialog({
	classroom,
	isDeleting,
	onClose,
	onConfirm,
}: DeleteClassroomDialogProps) {
	if (!classroom) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-classroom-title"
		>
			<div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
				<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
							<AlertTriangle className="size-5" />
						</span>
						<h2
							id="delete-classroom-title"
							className="text-lg font-bold text-slate-900 dark:text-slate-100"
						>
							Hapus Ruang Kelas
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
						aria-label="Tutup dialog"
					>
						<X className="size-5" />
					</button>
				</div>
				<div className="space-y-4 p-6">
					<p className="text-sm text-slate-600 dark:text-slate-300">
						Apakah Anda yakin ingin menghapus ruang kelas{" "}
						<strong className="font-bold text-slate-900 dark:text-slate-100">
							&quot;{classroom.roomName}&quot;
						</strong>
						({classroom.roomCode})? Data akan dihapus dari daftar ruangan.
					</p>
					<div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isDeleting}
						>
							Batal
						</Button>
						<Button
							type="button"
							onClick={onConfirm}
							disabled={isDeleting}
							className="bg-red-600 text-white hover:bg-red-700"
						>
							{isDeleting ? "Menghapus..." : "Ya, Hapus"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
