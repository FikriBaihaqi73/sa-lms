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
import type { StandardGrade } from "../types";

interface DeleteGradeDialogProps {
  grade: StandardGrade | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteGradeDialog({
  grade,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteGradeDialogProps) {
  if (!grade) return null;

  return (
    <AlertDialog open={Boolean(grade)} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-md border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-5" />
            <AlertDialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Hapus Standar Penilaian
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Apakah Anda yakin ingin menghapus standar predikat{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              &quot;{grade.grade}&quot;
            </span>
            {grade.description ? ` (${grade.description})` : ""}?
            Tindakan ini akan menonaktifkan skala predikat ini dari acuan penilaian akademik institusi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={onClose}
            className="h-9 text-xs"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={async (e) => {
              e.preventDefault();
              await onConfirm();
            }}
            className="h-9 text-xs bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus Standar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
