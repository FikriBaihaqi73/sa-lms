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
import type { MouseEvent } from "react";
import { useDeleteSemester } from "../hooks/useSemesters";
import type { Semester } from "../types";

interface DeleteSemesterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	semester: Semester | null;
}

export function DeleteSemesterDialog({ open, onOpenChange, semester }: DeleteSemesterDialogProps) {
	const { mutate: deleteSemester, isPending } = useDeleteSemester();
	if (!semester) return null;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Hapus semester?</AlertDialogTitle>
					<AlertDialogDescription>
						Data semester &quot;{semester.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
					<AlertDialogAction
						onClick={(event: MouseEvent<HTMLButtonElement>) => {
							event.preventDefault();
							deleteSemester(semester.id, { onSuccess: () => onOpenChange(false) });
						}}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? "Menghapus..." : "Ya, Hapus"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

