import { AlertTriangle } from "lucide-react";
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
import type { LearningModule } from "../types";

interface ModuleDeleteDialogProps {
	isOpen: boolean;
	module: LearningModule | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

export const ModuleDeleteDialog: React.FC<ModuleDeleteDialogProps> = ({
	isOpen,
	module,
	isDeleting,
	onClose,
	onConfirm,
}) => {
	if (!module) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-md border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
							<AlertTriangle className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
								Hapus Modul Pembelajaran?
							</DialogTitle>
							<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
								Tindakan ini tidak dapat dibatalkan.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
					<p>
						Anda akan menghapus modul{" "}
						<strong className="text-slate-900 dark:text-white">
							"{module.title}"
						</strong>
						. Seluruh konten materi atau tugas yang terhubung dengan modul ini akan
						diarsipkan.
					</p>
				</div>

				<DialogFooter className="pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
						className="border-slate-200 dark:border-slate-800"
					>
						Batal
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
						className="bg-red-600 text-white hover:bg-red-700"
					>
						{isDeleting ? "Menghapus..." : "Ya, Hapus Modul"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

