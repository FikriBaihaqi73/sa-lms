import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { KeyRound, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserSchema, updateUserSchema, type UserFormValues } from '../schemas/userSchema';
import type { User } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  initialData?: User | null;
  isSubmitting: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const isEditing = Boolean(initialData);
  const schema = isEditing ? updateUserSchema : createUserSchema;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(schema) as Resolver<UserFormValues>,
    defaultValues: { email: '', password: '', is_active: true },
  });

  useEffect(() => {
    reset({ email: initialData?.email ?? '', password: '', is_active: initialData?.is_active ?? true });
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800"><div className="flex items-center gap-2.5"><div className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400"><KeyRound className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">{isEditing ? 'Edit User' : 'Tambah User Baru'}</h2><p className="text-xs text-slate-500 dark:text-slate-400">{isEditing ? 'Perbarui informasi akun user' : 'Tambahkan akun user baru ke sistem'}</p></div></div><button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Tutup" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X className="h-5 w-5" /></button></div>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
      <div className="space-y-1.5"><Label htmlFor="user-email" className="text-sm font-semibold">Email <span className="text-red-500">*</span></Label><Input id="user-email" type="email" placeholder="user@example.com" {...register('email')} disabled={isSubmitting} className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-blue-500" />{errors.email && <p className="text-xs font-medium text-red-500">{errors.email.message}</p>}</div>
      <div className="space-y-1.5"><Label htmlFor="user-password" className="text-sm font-semibold">Password {!isEditing && <span className="text-red-500">*</span>}</Label><Input id="user-password" type="password" autoComplete="new-password" placeholder={isEditing ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'} {...register('password')} disabled={isSubmitting} className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-blue-500" />{errors.password && <p className="text-xs font-medium text-red-500">{errors.password.message}</p>}{isEditing && <p className="text-[11px] text-slate-400 dark:text-slate-500">Password lama tidak ditampilkan dan tidak akan dikirim jika kolom ini kosong.</p>}</div>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950"><input id="user-active" type="checkbox" {...register('is_active')} disabled={isSubmitting} className="h-4 w-4 accent-blue-600" /><Label htmlFor="user-active" className="text-sm font-semibold">Status Aktif</Label></div>
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="border-slate-200 dark:border-slate-800">Batal</Button><Button type="submit" disabled={isSubmitting} className="bg-blue-600 font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditing ? 'Simpan Perubahan' : 'Buat User'}</Button></div>
    </form>
  </div></div>;
};
