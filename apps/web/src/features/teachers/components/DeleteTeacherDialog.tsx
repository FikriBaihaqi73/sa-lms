import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teacherDisplayName, teacherClassCount } from "./TeachersTable";
import type { Teacher } from "../types";

interface DeleteTeacherDialogProps {
  teacher: Teacher | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteTeacherDialog({ teacher, isDeleting, onClose, onConfirm }: DeleteTeacherDialogProps) {
  if (!teacher) return null;
  const classCount = teacherClassCount(teacher);
  const canDelete = classCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="size-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hapus guru</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Tutup dialog">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-2 p-6 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Hapus <span className="font-bold text-slate-900 dark:text-slate-100">{teacherDisplayName(teacher)}</span>{" "}
            ({teacher.teacher_number})?
          </p>
          {!canDelete && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              Guru ini masih mengampu {classCount} kelas dan tidak dapat dihapus.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting} className="h-10 px-4 text-sm font-semibold">
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting || !canDelete} className="h-10 px-5 text-sm font-semibold">
            {isDeleting ? "Menghapus..." : "Hapus guru"}
          </Button>
        </div>
      </div>
    </div>
  );
}
