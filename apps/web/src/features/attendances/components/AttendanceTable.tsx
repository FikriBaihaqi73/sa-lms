import React from "react";
import { Edit2, RefreshCw, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Attendance, AttendancePaginationMeta } from "../types";

interface AttendanceTableProps {
  attendances: Attendance[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry: () => void;
  onEdit: (attendance: Attendance) => void;
  onDelete: (attendance: Attendance) => void;
  meta?: AttendancePaginationMeta;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function getStatusBadgeClass(statusName?: string): string {
  const normalized = statusName?.toLowerCase() ?? "";
  if (normalized.includes("hadir") || normalized.includes("present")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  }
  if (normalized.includes("izin") || normalized.includes("permit")) {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
  }
  if (normalized.includes("sakit") || normalized.includes("sick")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
  }
  if (normalized.includes("alpa") || normalized.includes("absent") || normalized.includes("alpha")) {
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
  }
  return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendances,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
  meta,
  onPageChange,
  limit,
  onLimitChange,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Memuat data presensi...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20"
      >
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error?.message || "Gagal memuat data presensi. Silakan coba lagi."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-3 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (attendances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <UserCheck className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Belum ada data presensi
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Data presensi siswa akan muncul di sini setelah dicatat melalui tombol di atas atau jadwal pembelajaran.
        </p>
      </div>
    );
  }

  const currentPage = meta?.currentPage ?? 1;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const totalData = meta?.totalData ?? attendances.length;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Siswa</th>
                <th className="px-4 py-3.5">Kelas & Pelajaran</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Catatan</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendances.map((item) => {
                const studentName =
                  item.student?.profile?.fullName || "Nama tidak tersedia";
                const studentNumber = item.student?.studentNumber;
                const className =
                  item.schedule?.classSubject?.class?.name || "Kelas —";
                const subjectName =
                  item.schedule?.classSubject?.subject?.name || "Mata Pelajaran —";
                const roomName =
                  item.schedule?.classroom?.roomName ||
                  item.schedule?.classroom?.roomCode ||
                  "";
                const teacherName =
                  item.schedule?.classSubject?.teacher?.profile?.fullName || "";
                const statusName = item.attendance_status?.name || "—";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {formatDate(item.attendance_date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {studentName}
                      </div>
                      {studentNumber && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          NISN: {studentNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {className} • {subjectName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {[roomName, teacherName].filter(Boolean).join(" • ") || "—"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          statusName,
                        )}`}
                      >
                        {statusName}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {item.notes || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                          title="Ubah Presensi"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Ubah</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(item)}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                          title="Hapus Presensi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <span>Per halaman:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Jumlah per halaman"
              className="h-7 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              Menampilkan {attendances.length} dari {totalData} data
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-7 px-2.5 text-xs"
            >
              Sebelumnya
            </Button>
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-7 px-2.5 text-xs"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

