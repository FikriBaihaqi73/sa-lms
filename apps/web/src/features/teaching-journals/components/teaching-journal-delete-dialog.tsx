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
import type { TeachingJournal } from "../types";

interface TeachingJournalDeleteDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	journal: TeachingJournal | null;
	isDeleting?: boolean;
}

export const TeachingJournalDeleteDialog: React.FC<
	TeachingJournalDeleteDialogProps
> = ({ isOpen, onClose, onConfirm, journal, isDeleting = false }) => {
	if (!journal) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
						<AlertTriangle className="size-6" />
					</div>
					<DialogTitle className="text-center text-lg font-bold text-slate-900 dark:text-slate-100">
						Hapus Jurnal Mengajar?
					</DialogTitle>
					<DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
						Apakah Anda yakin ingin menghapus catatan jurnal pertemuan #
						{journal.meeting_number ?? "—"}{" "}
						{journal.topic ? `("${journal.topic}")` : ""}? Tindakan ini dapat
						dibatalkan melalui sistem jika diperlukan.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mt-4 flex gap-2 sm:justify-center">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
						className="flex-1"
					>
						Batal
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
						className="flex-1 bg-red-600 text-white hover:bg-red-700"
					>
						{isDeleting ? "Menghapus..." : "Ya, Hapus Jurnal"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
