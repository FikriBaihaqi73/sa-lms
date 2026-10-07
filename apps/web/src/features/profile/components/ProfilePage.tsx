import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { ProfileHeader } from './ProfileHeader';
import { ProfileForm } from './ProfileForm';
import type { ProfileFormValues } from '../schemas/profileSchema';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Shield, Mail, AlertTriangle } from 'lucide-react';

export function ProfilePage() {
  const { profile, isPending, isError, refresh } = useProfile();
  const { updateProfile, isPending: isSaving } = useUpdateProfile();

  const handleSave = async (values: ProfileFormValues) => {
    await updateProfile({
      fullName: values.fullName,
      identityNumber: values.identityNumber || undefined,
      gender: values.gender || undefined,
      birthPlace: values.birthPlace || undefined,
      birthDate: values.birthDate || undefined,
      religionId: values.religionId || undefined,
      nationalityId: values.nationalityId || undefined,
      address: values.address || undefined,
      phoneNumber: values.phoneNumber || undefined,
      email: values.email || undefined,
      photoUrl: values.photoUrl || undefined,
    });
    refresh();
  };

  if (isPending) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-bold">Gagal memuat profil admin</h3>
            <p className="text-xs text-red-700 dark:text-red-400">
              Pastikan Anda sudah login dan server backend NestJS berjalan dengan baik.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Visual */}
      <ProfileHeader profile={profile} />

      {/* Institution Overview Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Institusi Naungan</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile?.institution?.name || 'Default Institution'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hak Akses Sistem</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile?.role?.name || 'Admin / Pemilik Institusi'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status Email</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile?.email || 'admin@nexora.com'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Profile Form */}
      <ProfileForm profile={profile} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
