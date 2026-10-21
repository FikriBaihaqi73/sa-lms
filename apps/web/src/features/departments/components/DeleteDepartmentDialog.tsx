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
import type { Department } from "../types";

interface DeleteDepartmentDialogProps {
  department: Department | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteDepartmentDialog({
  department,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteDepartmentDialogProps) {
  if (!department) return null;

  const assignedCount = department.teachers?.length ?? department._count?.teachers ?? 0;

  return (
    <AlertDialog open={Boolean(department)} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-md border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-5" />
            <AlertDialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Hapus Departemen
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Apakah Anda yakin ingin menghapus departemen{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              &quot;{department.name}&quot; ({department.code})
            </span>
            ?
            {assignedCount > 0 && (
              <span className="block mt-2 font-medium text-amber-600 dark:text-amber-400">
                Peringatan: Terdapat {assignedCount} guru/staf yang saat ini ditugaskan di departemen ini. Penugasan mereka ke departemen ini akan otomatis dilepas.
              </span>
            )}
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
            {isDeleting ? "Menghapus..." : "Ya, Hapus Departemen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
