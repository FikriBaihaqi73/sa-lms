import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '../schemas/profileSchema';
import type { Profile } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNationalities } from '@/features/nationalities/hooks/useNationalities';
import { useReligions } from '@/features/religions/hooks/useReligions';
import { CheckCircle2, AlertCircle, Save, User, Contact } from 'lucide-react';

interface ProfileFormProps {
  profile: Profile | null;
  onSave: (values: ProfileFormValues) => Promise<void>;
  isSaving: boolean;
}

export function ProfileForm({ profile, onSave, isSaving }: ProfileFormProps) {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: nationalities } = useNationalities();
  const { data: religionsData } = useReligions({ page: 1, limit: 100 });
  const religions = Array.isArray(religionsData) ? religionsData : (religionsData as any)?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      identityNumber: profile?.identityNumber || '',
      gender: profile?.gender || '',
      birthPlace: profile?.birthPlace || '',
      birthDate: profile?.birthDate || '',
      religionId: profile?.religionId || '',
      nationalityId: profile?.nationalityId || '',
      address: profile?.address || '',
      phoneNumber: profile?.phoneNumber || '',
      email: profile?.email || '',
      photoUrl: profile?.photoUrl || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        identityNumber: profile.identityNumber || '',
        gender: profile.gender || '',
        birthPlace: profile.birthPlace || '',
        birthDate: profile.birthDate || '',
        religionId: profile.religionId || '',
        nationalityId: profile.nationalityId || '',
        address: profile.address || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        photoUrl: profile.photoUrl || '',
      });
    }
  }, [profile, reset]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');
      await onSave(data);
      setSuccessMessage('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan profil. Silakan coba lagi.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Identitas Diri */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <User className="h-5 w-5 text-blue-600" />
              Identitas Diri
            </CardTitle>
            <CardDescription>Informasi pribadi & data identitas pemilik akun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold">Nama Lengkap *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Masukkan nama lengkap"
                className="h-10"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="identityNumber" className="text-xs font-semibold">Nomor Identitas (NIK / NIP)</Label>
              <Input
                id="identityNumber"
                {...register('identityNumber')}
                placeholder="Contoh: 3171012304890001"
                className="h-10"
              />
              {errors.identityNumber && (
                <p className="text-xs text-red-500 font-medium">{errors.identityNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-semibold">Jenis Kelamin</Label>
                <select
                  id="gender"
                  {...register('gender')}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthDate" className="text-xs font-semibold">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birthPlace" className="text-xs font-semibold">Tempat Lahir</Label>
              <Input
                id="birthPlace"
                {...register('birthPlace')}
                placeholder="Kota tempat lahir"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="religionId" className="text-xs font-semibold">Agama</Label>
                <select
                  id="religionId"
                  {...register('religionId')}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">-- Pilih Agama --</option>
                  {religions?.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nationalityId" className="text-xs font-semibold">Kewarganegaraan</Label>
                <select
                  id="nationalityId"
                  {...register('nationalityId')}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">-- Pilih Kewarganegaraan --</option>
                  {nationalities?.map((n: any) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kontak & Lokasi */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Contact className="h-5 w-5 text-blue-600" />
              Kontak & Alamat
            </CardTitle>
            <CardDescription>Informasi kontak resmi & alamat domisili</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Email Resmi</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@institusi.ac.id"
                className="h-10"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs font-semibold">Nomor Telepon / HP</Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="081234567890"
                className="h-10"
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photoUrl" className="text-xs font-semibold">URL Foto Profil</Label>
              <Input
                id="photoUrl"
                {...register('photoUrl')}
                placeholder="https://example.com/photo.jpg"
                className="h-10"
              />
              {errors.photoUrl && (
                <p className="text-xs text-red-500 font-medium">{errors.photoUrl.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">Alamat Domisili Lengkap</Label>
              <textarea
                id="address"
                {...register('address')}
                rows={3}
                placeholder="Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan..."
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
              {errors.address && (
                <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-11 px-8 font-semibold shadow-md transition-all hover:shadow-lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
        </Button>
      </div>
    </form>
  );
}
