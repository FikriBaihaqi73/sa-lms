import { AlertCircle, Edit2, GraduationCap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassItem } from "../types";

interface ClassesTableProps {
  rows: ClassItem[];
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  total: number;
  onRetry: () => void;
  onEdit: (classItem: ClassItem) => void;
  onDelete: (classItem: ClassItem) => void;
}

export function ClassesTable({ rows, isLoading, isError, searchTerm, total, onRetry, onEdit, onDelete }: ClassesTableProps) {
  if (isLoading) return <div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />)}</div>;
  if (isError) return <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"><AlertCircle className="mx-auto mb-2 size-8" /><p className="font-semibold">Gagal memuat data kelas</p><p className="text-sm opacity-90">Pastikan backend terhubung di VITE_API_URL.</p><button type="button" onClick={onRetry} className="mt-3 font-semibold underline">Coba lagi</button></div>;
  if (rows.length === 0) return <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"><GraduationCap className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" /><p className="text-base font-semibold text-slate-800 dark:text-slate-200">{searchTerm ? "Kelas tidak ditemukan untuk pencarian ini" : "Belum ada data kelas"}</p><p className="mt-1 text-sm">{searchTerm ? "Coba gunakan kata kunci lain." : "Klik Tambah Kelas untuk menambahkan data."}</p></div>;

  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400"><tr><th className="px-5 py-3.5">Kelas</th><th className="px-5 py-3.5">Institusi</th><th className="px-5 py-3.5">Tahun Ajaran</th><th className="px-5 py-3.5">Tingkat</th><th className="px-5 py-3.5">Siswa Terdaftar</th><th className="px-5 py-3.5 text-right">Aksi</th></tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">{rows.map((classItem) => <tr key={classItem.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
          <td className="px-5 py-4"><div className="font-semibold text-slate-900 dark:text-slate-100">{classItem.name}</div>{classItem.homeroom_teacher?.teacher_number && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Wali: {classItem.homeroom_teacher.teacher_number}</div>}</td>
          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{classItem.institution?.name ?? "-"}</td>
          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{classItem.academic_year?.academic_year ?? "-"}</td>
          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">Kelas {classItem.grade_level}</td>
          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{(classItem._count?.classStudents ?? 0).toLocaleString("id-ID")}</td>
          <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-1.5 opacity-90 transition-opacity group-hover:opacity-100"><Button variant="outline" size="sm" onClick={() => onEdit(classItem)} className="h-8 px-2.5 text-slate-700 dark:border-slate-700 dark:text-slate-300" title="Ubah Kelas"><Edit2 className="mr-1 size-3.5" />Ubah</Button><Button variant="outline" size="sm" onClick={() => onDelete(classItem)} className="h-8 px-2.5 text-red-600 dark:border-slate-700 dark:text-red-400" title="Hapus Kelas"><Trash2 className="mr-1 size-3.5" />Hapus</Button></div></td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400"><span>Menampilkan {rows.length} dari {total >= 0 ? total : "Tidak tersedia"} kelas</span><span>Direktori Kelas</span></div>
  </div>;
}
