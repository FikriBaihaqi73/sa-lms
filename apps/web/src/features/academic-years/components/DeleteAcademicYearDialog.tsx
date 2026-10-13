
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
import { useDeleteAcademicYear } from "../hooks/useAcademicYears";
import type { AcademicYear } from "../types";

interface DeleteAcademicYearDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	academicYear: AcademicYear | null;
}

export function DeleteAcademicYearDialog({
	open,
	onOpenChange,
	academicYear,
}: DeleteAcademicYearDialogProps) {
	const { mutate: deleteAcademicYear, isPending } = useDeleteAcademicYear();

	if (!academicYear) return null;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
					<AlertDialogDescription>
						Tindakan ini tidak dapat dibatalkan. Tahun ajaran
						"{academicYear.academic_year}" akan dihapus secara permanen.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							deleteAcademicYear(academicYear.id, {
								onSuccess: () => onOpenChange(false),
							});
						}}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? "Menghapus..." : "Hapus"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
