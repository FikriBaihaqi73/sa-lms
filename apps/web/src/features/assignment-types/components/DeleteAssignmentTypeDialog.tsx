import { AlertTriangle, Loader2 } from "lucide-react";
import type { AssignmentType } from "../types";

interface DeleteAssignmentTypeDialogProps {
  assignmentType: AssignmentType;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAssignmentTypeDialog({
  assignmentType,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAssignmentTypeDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hapus Tipe Tugas
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Apakah Anda yakin ingin menghapus tipe tugas{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                "{assignmentType.name}"
              </span>
              ? Tindakan ini dapat memengaruhi penugasan terkait.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Hapus Tipe Tugas
          </button>
        </div>
      </div>
    </div>
  );
}
