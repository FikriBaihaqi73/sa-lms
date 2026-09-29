import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { permissionFormSchema, type PermissionFormValues } from '../schemas/permissionSchema';
import type { Permission } from '../types';

interface PermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PermissionFormValues) => Promise<void>;
  initialData?: Permission | null;
  isSubmitting: boolean;
}

export const PermissionFormModal: React.FC<PermissionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: '',
      module: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        module: initialData.module,
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        module: '',
        description: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isEditing ? 'Edit Permission' : 'Tambah Permission Baru'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Perbarui informasi permission hak akses modul'
                  : 'Tambahkan permission baru untuk kontrol akses RBAC'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Permission Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold">
              Nama Permission <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. users.create, classes.read, reports.export"
              {...register('name')}
              disabled={isSubmitting}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono text-sm focus-visible:ring-blue-500"
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
            )}
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Format umum: <code className="text-blue-600 dark:text-blue-400">modul.aksi</code> (cth: <code className="text-blue-600 dark:text-blue-400">students.update</code>)
            </p>
          </div>

          {/* Module Name */}
          <div className="space-y-1.5">
            <Label htmlFor="module" className="text-sm font-semibold">
              Modul Sistem <span className="text-red-500">*</span>
            </Label>
            <Input
              id="module"
              placeholder="e.g. users, students, academic, finance"
              {...register('module')}
              disabled={isSubmitting}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-blue-500"
            />
            {errors.module && (
              <p className="text-xs font-medium text-red-500">{errors.module.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-semibold">
              Deskripsi (Opsional)
            </Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Penjelasan singkat fungsi permission ini..."
              {...register('description')}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Simpan Perubahan' : 'Buat Permission'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
