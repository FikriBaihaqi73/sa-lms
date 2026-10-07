import { ChevronLeft, ChevronRight, Edit2, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AttendanceStatus, AttendanceStatusPageMeta } from '../types';

interface AttendanceStatusesTableProps {
  attendanceStatuses: AttendanceStatus[];
  meta?: AttendanceStatusPageMeta;
  isLoading: boolean;
  isFetching: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (item: AttendanceStatus) => void;
  onDelete: (item: AttendanceStatus) => void;
}

export function AttendanceStatusesTable({
  attendanceStatuses,
  meta,
  isLoading,
  isFetching,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
}: AttendanceStatusesTableProps) {
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? attendanceStatuses.length;
  const firstItem = attendanceStatuses.length > 0 ? (page - 1) * limit + 1 : 0;
  const lastItem = attendanceStatuses.length > 0 ? firstItem + attendanceStatuses.length - 1 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari status kehadiran..."
            aria-label="Cari status kehadiran"
            className="h-9 w-full pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Memuat data...</td></tr>
            ) : attendanceStatuses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  {search.trim() ? 'Pencarian tidak ditemukan.' : 'Belum ada status kehadiran.'}
                </td>
              </tr>
            ) : (
              attendanceStatuses.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{firstItem + index}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="size-8 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                        <Edit2 className="size-4" /><span className="sr-only">Edit {item.name}</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="size-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">
                        <Trash2 className="size-4" /><span className="sr-only">Delete {item.name}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan {firstItem} hingga {lastItem} dari {meta?.total ?? 0} data
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isFetching} className="size-8">
            <ChevronLeft className="size-4" /><span className="sr-only">Halaman sebelumnya</span>
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Halaman {page} dari {totalPages}</span>
          <Button variant="outline" size="icon" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || isFetching} className="size-8">
            <ChevronRight className="size-4" /><span className="sr-only">Halaman berikutnya</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
