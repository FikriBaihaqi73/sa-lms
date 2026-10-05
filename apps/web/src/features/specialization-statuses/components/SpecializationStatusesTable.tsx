import { Edit, Search, Trash2 } from 'lucide-react';
import type { SpecializationStatus } from '../types';

interface SpecializationStatusesTableProps {
  specializationStatuses: SpecializationStatus[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (specializationStatus: SpecializationStatus) => void;
  onDelete: (specializationStatus: SpecializationStatus) => void;
}

export function SpecializationStatusesTable({
  specializationStatuses,
  isLoading,
  search,
  onSearchChange,
  onEdit,
  onDelete,
}: SpecializationStatusesTableProps) {
  const q = search.trim().toLowerCase();
  const rows = specializationStatuses.filter(
    (item) =>
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q) ||
      (item.code ?? '').toLowerCase().includes(q),
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode status, nama status, atau deskripsi..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3.5">Kode</th>
              <th className="px-6 py-3.5">Nama Status</th>
              <th className="px-6 py-3.5">Keterangan</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Tidak ada data.</td></tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-mono text-xs font-semibold">{item.code}</td>
                  <td className="px-6 py-4 font-semibold">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.description || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => onEdit(item)} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50">
                        <Edit className="size-3.5" /> Ubah
                      </button>
                      <button type="button" onClick={() => onDelete(item)} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50">
                        <Trash2 className="size-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
