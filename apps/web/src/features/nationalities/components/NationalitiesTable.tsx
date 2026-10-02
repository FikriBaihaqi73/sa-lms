import { Edit, Flag, Globe, Search, Trash2, Users } from 'lucide-react';
import type { Nationality } from '../types';

interface NationalitiesTableProps {
  nationalities: Nationality[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (nationality: Nationality) => void;
  onDelete: (nationality: Nationality) => void;
}

export function NationalitiesTable({
  nationalities,
  isLoading,
  search,
  onSearchChange,
  onEdit,
  onDelete,
}: NationalitiesTableProps) {
  const filteredNationalities = nationalities.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Globe className="size-6" />
          </span>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isLoading ? '...' : nationalities.length}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Kewarganegaraan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Flag className="size-6" />
          </span>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isLoading
                ? '...'
                : nationalities.filter((n) => n.name.toLowerCase() === 'indonesia').length > 0
                ? 'Domestik & Asing'
                : 'Terdaftar'}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Cakupan Wilayah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="grid size-12 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <Users className="size-6" />
          </span>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Aktif
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Status Referensi
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari kewarganegaraan atau deskripsi..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">#</th>
                <th className="px-6 py-3.5">Nama Kewarganegaraan</th>
                <th className="px-6 py-3.5">Keterangan</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Memuat data kewarganegaraan...
                  </td>
                </tr>
              ) : filteredNationalities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    {search ? 'Tidak ada kewarganegaraan yang cocok dengan pencarian.' : 'Belum ada data kewarganegaraan.'}
                  </td>
                </tr>
              ) : (
                filteredNationalities.map((item, index) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <Globe className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {item.description || <span className="italic text-slate-400 dark:text-slate-500">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                        >
                          <Edit className="size-3.5" />
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="size-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Menampilkan {filteredNationalities.length} dari {nationalities.length} kewarganegaraan.
        </div>
      </div>
    </div>
  );
}
