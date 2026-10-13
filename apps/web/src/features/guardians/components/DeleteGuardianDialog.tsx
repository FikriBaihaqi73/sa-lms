import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Guardian } from "../types";

interface DeleteGuardianDialogProps {
  guardian: Guardian | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteGuardianDialog({
  guardian,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteGuardianDialogProps) {
  if (!guardian) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-guardian-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="size-5" />
            </span>
            <h2 id="delete-guardian-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Hapus Guardian?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Guardian{" "}
            <strong className="font-bold text-slate-900 dark:text-slate-100">
              "{guardian.fullName}"
            </strong>{" "}
            akan disembunyikan dari daftar melalui soft delete.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Data tidak dihapus secara permanen dan tidak akan tampil pada daftar aktif.
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting} className="h-10 px-4 text-sm font-semibold">
              Batal
            </Button>
            <Button type="button" disabled={isDeleting} onClick={onConfirm} className="h-10 bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isDeleting ? "Memproses..." : "Ya, Sembunyikan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
