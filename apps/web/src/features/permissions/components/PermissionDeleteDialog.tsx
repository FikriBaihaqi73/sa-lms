import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Permission } from '../types';

interface PermissionDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  permission: Permission | null;
  isDeleting: boolean;
}

export const PermissionDeleteDialog: React.FC<PermissionDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  permission,
  isDeleting,
}) => {
  if (!isOpen || !permission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Hapus Permission?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tindakan ini akan menghapus akses permission ini secara permanen dari sistem.
            </p>
          </div>
        </div>

        <div className="my-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-800 dark:text-slate-200">
          <span className="font-semibold text-blue-600 dark:text-blue-400">{permission.name}</span>{' '}
          <span className="text-xs text-slate-400">({permission.module})</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-200 dark:border-slate-800"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Hapus Permission
          </Button>
        </div>
      </div>
    </div>
  );
};
