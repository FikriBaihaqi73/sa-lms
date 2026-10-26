import { AlertTriangle } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ClassStudentItem } from "../types";

interface RemoveClassStudentDialogProps {
	open: boolean;
	item: ClassStudentItem | null;
	bulkCount?: number;
	isRemoving: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

export function RemoveClassStudentDialog({
	open,
	item,
	bulkCount = 0,
	isRemoving,
	onClose,
	onConfirm,
}: RemoveClassStudentDialogProps) {
	const isBulk = bulkCount > 0;
	const studentName =
		item?.student?.profile?.fullName ||
		(item?.student?.studentNumber
			? `Siswa #${item.student.studentNumber}`
			: "Siswa terpilih");
	const className = item?.classes?.name || "kelas yang bersangkutan";

	const targetSubject = isBulk ? `${bulkCount} siswa terpilih` : studentName;

	return (
		<AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<AlertDialogContent className="sm:max-w-md">
				<AlertDialogHeader>
					<div className="mb-2 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
						<AlertTriangle className="size-5" />
					</div>
					<AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
						Keluarkan dari kelas?
					</AlertDialogTitle>
					<AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400">
						<strong className="text-slate-900 dark:text-slate-200">
							{targetSubject}
						</strong>{" "}
						akan dikeluarkan dari kelas{" "}
						<strong className="text-slate-900 dark:text-slate-200">
							{className}
						</strong>
						. Data siswa tidak dihapus dan bisa dipulihkan dengan memilih Status
						Dikeluarkan.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						type="button"
						disabled={isRemoving}
						onClick={onClose}
						className="h-9 text-xs"
					>
						Batal
					</AlertDialogCancel>
					<AlertDialogAction
						type="button"
						disabled={isRemoving}
						onClick={(e) => {
							e.preventDefault();
							onConfirm();
						}}
						className="h-9 bg-red-600 text-xs font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
					>
						{isRemoving ? "Mengeluarkan..." : "Keluarkan"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
