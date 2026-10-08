import { AlertCircle, GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeachersTableProps } from "./TeachersTable";
import { TeacherRow } from "./TeacherRow";

export function TeachersTable({
  teachers,
  isLoading,
  isError,
  page,
  limit,
  total,
  onAdd,
  onEdit,
  onDelete,
}: TeachersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        <AlertCircle className="mx-auto mb-2 size-8" />
        <p className="font-semibold">Gagal memuat data guru</p>
        <p className="text-sm opacity-90">Pastikan backend terhubung di VITE_API_URL.</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <GraduationCap className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Belum ada data guru
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Tambahkan data master guru pertama untuk mulai mengelola penugasan kelas.
        </p>
        <Button
          type="button"
          onClick={onAdd}
          className="mt-5 h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="mr-2 size-4" /> Tambah guru
        </Button>
      </div>
    );
  }

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Guru</th>
              <th className="px-5 py-3.5">NIP</th>
              <th className="px-5 py-3.5">Spesialisasi</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Kelas Diampu</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {teachers.map((teacher) => (
              <TeacherRow key={teacher.id} teacher={teacher} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
        <span>
          Menampilkan {start}-{end} dari {total.toLocaleString("id-ID")} guru terdaftar
        </span>
        <span>Master Registry</span>
      </div>
    </div>
  );
}
