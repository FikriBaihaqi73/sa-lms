import { AlertCircle, Church, Edit, Search, Trash2 } from 'lucide-react';
import type { Religion, ReligionPageMeta } from '../types';

interface ReligionsTableProps {
  religions: Religion[];
  meta?: ReligionPageMeta;
  isLoading: boolean;
  isError: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (religion: Religion) => void;
  onDelete: (religion: Religion) => void;
}

export function ReligionsTable({
  religions,
  meta,
  isLoading,
  isError,
  search,
  onSearchChange,
  onEdit,
  onDelete,
}: ReligionsTableProps) {
  const totalPages = meta?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"><Church className="size-6" /></span>
          <div><p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{isLoading ? '...' : meta?.total ?? 0}</p><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Religion</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"><Search className="size-6" /></span>
          <div><p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{isLoading ? '...' : `${meta?.page ?? 0}/${totalPages}`}</p><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Halaman Aktif</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="grid size-12 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"><Church className="size-6" /></span>
          <div><p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Aktif</p><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status Referensi</p></div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="mx-auto mb-2 size-8 text-red-500" />
          <p className="font-semibold">Gagal memuat data religion</p>
          <p className="text-sm opacity-90">Periksa koneksi ke backend lalu coba lagi.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari nama religion..."
                aria-label="Cari religion"
                className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr><th className="px-6 py-3.5">#</th><th className="px-6 py-3.5">Nama Religion</th><th className="px-6 py-3.5 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((item) => <tr key={item}><td colSpan={3} className="px-6 py-3"><div className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" /></td></tr>)
                ) : religions.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center"><Church className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" /><p className="font-semibold text-slate-800 dark:text-slate-200">{search ? 'Tidak ada religion yang sesuai pencarian' : 'Belum ada data religion'}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{search ? 'Coba gunakan kata kunci lain.' : 'Klik tombol "Tambah Religion" untuk membuat data pertama.'}</p></td></tr>
                ) : (
                  religions.map((religion, index) => <tr key={religion.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{((meta?.page ?? 1) - 1) * (meta?.limit ?? religions.length) + index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100"><div className="flex items-center gap-2"><Church className="size-4 shrink-0 text-blue-600 dark:text-blue-400" /><span>{religion.name}</span></div></td>
                    <td className="whitespace-nowrap px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => onEdit(religion)} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"><Edit className="size-3.5" />Ubah</button><button type="button" onClick={() => onDelete(religion)} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"><Trash2 className="size-3.5" />Hapus</button></div></td>
                  </tr>)
                )}
              </tbody>
            </table>
          </div>
          {!isLoading && <div className="border-t border-slate-200 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">Menampilkan {religions.length} dari {meta?.total ?? 0} religion.</div>}
        </div>
      )}
    </div>
  );
}
