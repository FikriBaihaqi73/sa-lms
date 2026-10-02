import React from 'react';
import { AlertCircle, Edit2, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '../types';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  searchTerm: string;
  total: number;
}

function formatLastLogin(value: string | null): string {
  if (!value) return 'Belum login';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Belum login'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  isError,
  onEdit,
  onDelete,
  searchTerm,
  total,
}) => {
  if (isLoading) {
    return <div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />)}</div>;
  }

  if (isError) {
    return <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"><AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" /><p className="font-semibold">Gagal memuat data users</p><p className="text-sm opacity-90">Pastikan backend terhubung di VITE_API_URL.</p></div>;
  }

  if (users.length === 0) {
    return <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"><UserRound className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" /><p className="text-base font-semibold text-slate-800 dark:text-slate-200">{searchTerm ? 'Tidak ada user yang sesuai pencarian' : 'Tidak ada user ditemukan'}</p><p className="mt-1 text-sm">{searchTerm ? 'Coba gunakan kata kunci lain.' : 'Klik tombol "Tambah User" untuk membuat user pertama.'}</p></div>;
  }

  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
          <tr><th className="px-5 py-3.5">User</th><th className="px-5 py-3.5">Email</th><th className="px-5 py-3.5">Role</th><th className="px-5 py-3.5">Institution</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Last Login</th><th className="px-5 py-3.5 text-right">Aksi</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {users.map((user) => {
            const profile = user.profile?.[0];
            return <tr key={user.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{profile?.fullName || '-'}</td>
              <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
              <td className="px-5 py-4">{profile?.role?.name ? <span className="inline-flex rounded-md border border-blue-200/60 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/60 dark:text-blue-400">{profile.role.name}</span> : <span className="text-slate-400 dark:text-slate-600">-</span>}</td>
              <td className="px-5 py-4 text-slate-600 dark:text-slate-400"><div>{profile?.institution?.name || '-'}</div>{profile?.institution?.shortName && <div className="text-xs text-slate-400 dark:text-slate-500">{profile.institution.shortName}</div>}</td>
              <td className="px-5 py-4"><span className={user.is_active ? 'inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-400' : 'inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-800/50 dark:bg-red-950/50 dark:text-red-400'}>{user.is_active ? 'Aktif' : 'Tidak Aktif'}</span></td>
              <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatLastLogin(user.last_login)}</td>
              <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-1.5 opacity-90 transition-opacity group-hover:opacity-100"><Button variant="outline" size="sm" onClick={() => onEdit(user)} className="h-8 px-2.5 border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-400" title="Edit User"><Edit2 className="mr-1 h-3.5 w-3.5" />Edit</Button><Button variant="outline" size="sm" onClick={() => onDelete(user)} className="h-8 px-2.5 border-slate-200 px-2.5 text-red-600 hover:border-red-200 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/50" title="Hapus User"><Trash2 className="mr-1 h-3.5 w-3.5" />Hapus</Button></div></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400"><span>Menampilkan {users.length} dari {total} user</span><span className="font-mono text-slate-400 dark:text-slate-500">User Directory</span></div>
  </div>;
};
