import type React from "react";
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
import type { AttendanceScheduleItem } from "../types";

interface DeleteAttendanceScheduleDialogProps {
	open: boolean;
	item: AttendanceScheduleItem | null;
	isDeleting?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export const DeleteAttendanceScheduleDialog: React.FC<
	DeleteAttendanceScheduleDialogProps
> = ({ open, item, isDeleting = false, onOpenChange, onConfirm }) => {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="dark:bg-[#111927] dark:border-slate-800">
				<AlertDialogHeader>
					<AlertDialogTitle>Hapus Jadwal Absensi</AlertDialogTitle>
					<AlertDialogDescription>
						Apakah Anda yakin ingin menghapus jadwal absensi{" "}
						<span className="font-semibold text-slate-900 dark:text-white">
							"{item?.title}"
						</span>
						? Tindakan ini akan menonaktifkan jadwal tersebut dari daftar aktif.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							onConfirm();
						}}
						disabled={isDeleting}
						className="bg-rose-600 text-white hover:bg-rose-700"
					>
						{isDeleting ? "Menghapus..." : "Hapus Jadwal"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
