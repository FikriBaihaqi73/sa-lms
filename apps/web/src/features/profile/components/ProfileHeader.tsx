import type { Profile } from '../types';
import { Badge } from '@/components/ui/badge';
import { Building2, ShieldCheck, Mail, Phone, Calendar, UserCheck } from 'lucide-react';

interface ProfileHeaderProps {
  profile: Profile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const name = profile?.fullName || 'Admin Pemilik Institusi';
  const roleName = profile?.role?.name || 'Pemilik Institusi (Admin)';
  const institutionName = profile?.institution?.name || 'Utama / Default Institution';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="relative">
          {profile?.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={name}
              className="h-24 w-24 rounded-2xl border-2 border-blue-400/40 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-blue-400/30 bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-extrabold text-white shadow-lg">
              {initials}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-900" title="Akun Aktif">
            <UserCheck className="h-3.5 w-3.5 text-white" />
          </span>
        </div>

        {/* User Details */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{name}</h1>
            <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30 backdrop-blur-md">
              <ShieldCheck className="mr-1 h-3.5 w-3.5 text-blue-300" />
              {roleName}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              {institutionName}
            </span>
            {profile?.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                {profile.email}
              </span>
            )}
            {profile?.phoneNumber && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-400" />
                {profile.phoneNumber}
              </span>
            )}
            {profile?.createdAt && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Terdaftar {new Date(profile.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
