import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AcademicStatus } from '../types';

interface DeleteAcademicStatusDialogProps {
  academicStatus: AcademicStatus | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAcademicStatusDialog({
  academicStatus,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAcademicStatusDialogProps) {
  if (!academicStatus) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="size-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hapus Status Akademik</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus status akademik{' '}
            <strong className="font-bold text-slate-900 dark:text-slate-100">"{academicStatus.name}"</strong>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>

          {academicStatus.description && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <span className="font-semibold">Keterangan:</span> {academicStatus.description}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting} className="h-10 px-4 text-sm font-semibold">
              Batal
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="h-10 bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
