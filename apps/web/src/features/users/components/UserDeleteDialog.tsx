import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '../types';

interface UserDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
  isDeleting: boolean;
}

export const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({ isOpen, onClose, onConfirm, user, isDeleting }) => {
  if (!isOpen || !user) return null;
  const name = user.profile?.[0]?.fullName || '-';

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"><div className="flex items-center gap-4"><div className="rounded-full border border-red-100 bg-red-50 p-3 text-red-600 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-400"><AlertTriangle className="h-6 w-6" /></div><div><h3 className="text-lg font-bold">Hapus User?</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">User akan dinonaktifkan melalui proses soft delete.</p></div></div><div className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950"><p className="font-semibold text-blue-600 dark:text-blue-400">{name}</p><p className="mt-1 text-slate-500 dark:text-slate-400">{user.email}</p></div><p className="mb-4 text-xs text-slate-500 dark:text-slate-400">User yang dihapus tidak lagi tampil pada daftar users, tetapi data tidak dihapus permanen.</p><div className="flex items-center justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={isDeleting} className="border-slate-200 dark:border-slate-800">Batal</Button><Button type="button" onClick={onConfirm} disabled={isDeleting} className="bg-red-600 font-medium text-white hover:bg-red-700">{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus User</Button></div></div></div>;
};
