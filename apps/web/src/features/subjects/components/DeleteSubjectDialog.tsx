import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Subject } from "../types";
import { getSubjectErrorMessage } from "../utils/subject-error";

interface DeleteSubjectDialogProps {
	subject: Subject | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

export function DeleteSubjectDialog({ subject, isDeleting, onClose, onConfirm }: DeleteSubjectDialogProps) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const confirm = async () => {
		setErrorMessage(null);
		try {
			await onConfirm();
		} catch (error) {
			setErrorMessage(getSubjectErrorMessage(error));
		}
	};

	return (
		<AlertDialog open={Boolean(subject)} onOpenChange={(open) => { if (!open && !isDeleting) onClose(); }}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<Trash2 className="size-5 text-red-600" />
						Hapus mata pelajaran?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Mata pelajaran <strong>{subject?.name}</strong> akan dihapus dari daftar.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting} onClick={onClose}>Batal</AlertDialogCancel>
					<Button type="button" variant="destructive" onClick={() => void confirm()} disabled={isDeleting}>
						{isDeleting && <LoaderCircle className="animate-spin" />}
						Hapus
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
