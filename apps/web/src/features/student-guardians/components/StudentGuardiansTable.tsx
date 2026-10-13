import { AlertCircle, Edit2, Eye, Loader2, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentGuardian } from "../types";

interface StudentGuardiansTableProps {
  records: StudentGuardian[];
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  total: number;
  onDetail: (record: StudentGuardian) => void;
  onEdit: (record: StudentGuardian) => void;
  onDelete: (record: StudentGuardian) => void;
}

export function StudentGuardiansTable({
  records,
  isLoading,
  isError,
  searchTerm,
  total,
  onDetail,
  onEdit,
  onDelete,
}: StudentGuardiansTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        <AlertCircle className="mx-auto mb-2 size-8" />
        <p className="font-semibold">Gagal memuat data relasi</p>
        <p className="text-sm opacity-90">Pastikan backend terhubung di VITE_API_URL.</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <UsersRound className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          {searchTerm
            ? "Tidak ada relasi yang sesuai pencarian"
            : "Belum ada relasi siswa dan wali"}
        </p>
        <p className="mt-1 text-sm">
          {searchTerm
            ? "Coba gunakan kata kunci lain."
            : "Klik Tambah Relasi untuk menghubungkan siswa dengan wali."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Siswa</th>
              <th className="px-5 py-3.5">Wali</th>
              <th className="px-5 py-3.5">Hubungan</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {records.map((record) => (
              <tr
                key={record.id}
                className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {record.student?.profile?.fullName || "Profil belum tersedia"}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {record.student?.studentNumber}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-700 dark:text-slate-300">
                    {record.guardian?.fullName}
                  </div>
                  {record.guardian?.phoneNumber && (
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {record.guardian.phoneNumber}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                  {record.guardian?.relationship ?? "-"}
                </td>
                <td className="px-5 py-4">
                  {record.isPrimary ? (
                    <span className="inline-flex rounded-md border border-blue-200/60 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/60 dark:text-blue-400">
                      Wali Utama
                    </span>
                  ) : (
                    <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                      Wali Tambahan
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDetail(record)}
                      className="h-8 px-2.5 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                      title="Detail Relasi"
                    >
                      <Eye className="mr-1 size-3.5" />
                      Detail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(record)}
                      className="h-8 px-2.5 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                      title="Edit Relasi"
                    >
                      <Edit2 className="mr-1 size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(record)}
                      className="h-8 px-2.5 text-red-600 dark:border-slate-700 dark:text-red-400"
                      title="Hapus Relasi"
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Hapus
                    </Button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          {isLoading && <Loader2 className="size-3 animate-spin" />}
          Menampilkan {records.length} dari {total} relasi
        </span>
        <span>Student Guardian Relations</span>
      </div>
    </div>
  );
}
