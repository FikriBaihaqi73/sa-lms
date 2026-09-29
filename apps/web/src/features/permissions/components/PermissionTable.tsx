import React from 'react';
import { Edit2, Trash2, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Permission } from '../types';

interface PermissionTableProps {
  permissions: Permission[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
  searchTerm: string;
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  isLoading,
  isError,
  onEdit,
  onDelete,
  searchTerm,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-8 text-center text-red-600 dark:text-red-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="font-semibold">Gagal memuat data permissions</p>
        <p className="text-sm opacity-90">Pastikan backend terhubung di VITE_API_URL.</p>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-400">
        <KeyRound className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          {searchTerm ? 'Tidak ada permission yang sesuai filter pencarian' : 'Belum ada data permission'}
        </p>
        <p className="text-sm mt-1">
          {searchTerm ? 'Coba ubah kata kunci atau reset filter modul.' : 'Klik tombol "Tambah Permission" untuk membuat permission pertama.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Nama Permission</th>
              <th className="px-5 py-3.5">Modul</th>
              <th className="px-5 py-3.5">Deskripsi</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {permissions.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Permission Name */}
                <td className="px-5 py-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    <span>{item.name}</span>
                  </div>
                </td>

                {/* Module Badge */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
                    {item.module}
                  </span>
                </td>

                {/* Description */}
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400 max-w-md truncate">
                  {item.description || <span className="italic text-slate-400 dark:text-slate-600">- Tidak ada deskripsi -</span>}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="h-8 px-2.5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                      title="Edit Permission"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(item)}
                      className="h-8 px-2.5 text-red-600 dark:text-red-400 border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                      title="Hapus Permission"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer count info */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <span>Menampilkan {permissions.length} data permission</span>
        <span className="font-mono text-slate-400 dark:text-slate-500">RBAC Engine v1.0</span>
      </div>
    </div>
  );
};
