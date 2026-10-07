import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { attendanceStatusFormSchema, type AttendanceStatusFormValues } from '../schemas/attendanceStatusSchema';
import type { AttendanceStatus } from '../types';

interface AttendanceStatusDialogProps {
  open: boolean;
  attendanceStatus?: AttendanceStatus | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: AttendanceStatusFormValues) => Promise<void>;
}

export function AttendanceStatusDialog({ open, attendanceStatus, isSaving, onClose, onSave }: AttendanceStatusDialogProps) {
  const isEditing = Boolean(attendanceStatus);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceStatusFormValues>({
    resolver: zodResolver(attendanceStatusFormSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    reset({ name: attendanceStatus?.name ?? '', description: attendanceStatus?.description ?? '' });
  }, [attendanceStatus, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="attendance-status-dialog-title">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400"><ClipboardCheck className="size-5" /></span>
            <div>
              <h2 id="attendance-status-dialog-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEditing ? 'Ubah Attendance Status' : 'Tambah Attendance Status'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isEditing ? 'Perbarui status kehadiran yang sudah ada' : 'Tambahkan status kehadiran baru ke dalam sistem'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Tutup dialog"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="attendance-status-name" className="text-sm font-semibold">Name <span className="text-red-500">*</span></Label>
            <Input id="attendance-status-name" {...register('name')} placeholder="Contoh: Hadir, Izin, Sakit" className="h-11" disabled={isSaving} />
            {errors.name && <p className="text-xs font-medium text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendance-status-description" className="text-sm font-semibold">Description <span className="text-xs font-normal text-slate-500">(Opsional)</span></Label>
            <textarea id="attendance-status-description" {...register('description')} rows={3} placeholder="Tambahkan deskripsi status kehadiran..." disabled={isSaving} className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30" />
            {errors.description && <p className="text-xs font-medium text-red-500">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-sm font-semibold">Batal</Button>
            <Button type="submit" disabled={isSaving} className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">{isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Status'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
