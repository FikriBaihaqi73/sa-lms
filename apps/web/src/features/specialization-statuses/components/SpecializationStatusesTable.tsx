import { Edit, Search, Trash2 } from 'lucide-react';
import type { Specialization } from '../types';

interface SpecializationStatusesTableProps {
  specializationStatuses: Specialization[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (specialization: Specialization) => void;
  onDelete: (specialization: Specialization) => void;
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
      (item.description ?? '').toLowerCase().includes(q),
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
            placeholder="Cari nama peminatan, konsentrasi, atau deskripsi..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3.5 w-16 text-center">No</th>
              <th className="px-6 py-3.5">Nama Peminatan / Konsentrasi</th>
              <th className="px-6 py-3.5">Deskripsi / Cakupan Keahlian</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Memuat data peminatan...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  {search ? 'Tidak ada peminatan yang cocok dengan pencarian.' : 'Belum ada data peminatan terdaftar.'}
                </td>
              </tr>
            ) : (
              rows.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 text-center font-mono text-xs text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {item.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                      >
                        <Edit className="size-3.5" /> Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
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
