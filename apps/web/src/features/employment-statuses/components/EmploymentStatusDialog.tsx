import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { employmentStatusFormSchema, type EmploymentStatusFormValues } from '../schemas/employmentStatusSchema';
import type { EmploymentStatus } from '../types';

interface EmploymentStatusDialogProps {
  open: boolean;
  employmentStatus?: EmploymentStatus | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: EmploymentStatusFormValues) => Promise<void>;
}

export function EmploymentStatusDialog({
  open,
  employmentStatus,
  isSaving,
  onClose,
  onSave,
}: EmploymentStatusDialogProps) {
  const isEditing = Boolean(employmentStatus);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmploymentStatusFormValues>({
    resolver: zodResolver(employmentStatusFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (employmentStatus) {
      reset({
        name: employmentStatus.name,
        description: employmentStatus.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [employmentStatus, reset]);

  if (!open) return null;

  const onSubmit = async (values: EmploymentStatusFormValues) => {
    await onSave(values);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <Briefcase className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Ubah Status Karyawan' : 'Tambah Status Karyawan'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Perbarui data status karyawan yang sudah ada'
                  : 'Tambahkan opsi status karyawan baru ke dalam sistem'}
              </p>
            </div>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Nama Status <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Contoh: Permanent, Contract, Freelance"
              className="h-11"
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Keterangan <span className="text-xs font-normal text-slate-500">(Opsional)</span>
            </Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Tambahkan catatan atau deskripsi..."
              className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 px-4 text-sm font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSaving
                ? 'Menyimpan...'
                : isEditing
                ? 'Simpan Perubahan'
                : 'Tambah Status'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
