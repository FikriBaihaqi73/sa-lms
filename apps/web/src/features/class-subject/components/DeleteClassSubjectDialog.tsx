import { AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ClassSubject } from "../types";

interface Props { item: ClassSubject | null; isDeleting: boolean; onClose: () => void; onConfirm: () => Promise<void> }

export function DeleteClassSubjectDialog({ item, isDeleting, onClose, onConfirm }: Props) {
  return <AlertDialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}><AlertDialogContent className="sm:max-w-md"><AlertDialogHeader><div className="mb-2 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"><AlertTriangle className="size-5" /></div><AlertDialogTitle>Hapus mata pelajaran kelas?</AlertDialogTitle><AlertDialogDescription>Relasi <strong>{item?.class?.name ?? "kelas"}</strong> dan <strong>{item?.subject?.name ?? "mata pelajaran"}</strong> akan dihapus secara soft delete.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel type="button" disabled={isDeleting} onClick={onClose}>Batal</AlertDialogCancel><AlertDialogAction type="button" disabled={isDeleting} onClick={(event) => { event.preventDefault(); void onConfirm(); }} className="bg-red-600 text-white hover:bg-red-700">{isDeleting ? "Menghapus..." : "Hapus"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
