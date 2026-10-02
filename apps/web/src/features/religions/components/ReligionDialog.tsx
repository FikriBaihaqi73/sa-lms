import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Church, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { religionFormSchema, type ReligionFormValues } from '../schemas/religionSchema';
import type { Religion } from '../types';

interface ReligionDialogProps {
  open: boolean;
  religion?: Religion | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: ReligionFormValues) => Promise<void>;
}

export function ReligionDialog({
  open,
  religion,
  isSaving,
  onClose,
  onSave,
}: ReligionDialogProps) {
  const isEditing = Boolean(religion);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReligionFormValues>({
    resolver: zodResolver(religionFormSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    reset({ name: religion?.name ?? '' });
  }, [religion, open, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="religion-dialog-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <Church className="size-5" />
            </span>
            <div>
              <h2 id="religion-dialog-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Ubah Religion' : 'Tambah Religion'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? 'Perbarui data religion yang sudah ada' : 'Tambahkan data religion baru ke sistem'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="religion-name" className="text-sm font-semibold">
              Nama Religion <span className="text-red-500">*</span>
            </Label>
            <Input
              id="religion-name"
              {...register('name')}
              maxLength={100}
              disabled={isSaving}
              placeholder="Contoh: Islam"
              className="h-11"
            />
            {errors.name && <p className="text-xs font-medium text-red-500">{errors.name.message}</p>}
            <p className="text-xs text-slate-400 dark:text-slate-500">Maksimal 100 karakter.</p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-sm font-semibold">
              Batal
            </Button>
            <Button type="submit" disabled={isSaving} className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Religion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
