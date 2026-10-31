import {
  AlertCircle,
  Calendar,
  Clock,
  DoorOpen,
  Edit2,
  GraduationCap,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Schedule, SchedulePageMeta } from "../types";
import { formatTimeRange, getDayBadgeColor } from "../utils";

interface SchedulesTableProps {
  schedules: Schedule[];
  isLoading: boolean;
  isError: boolean;
  meta: SchedulePageMeta;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onOpenCreate: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onRetry: () => void;
}

export function SchedulesTable({
  schedules,
  isLoading,
  isError,
  meta,
  limit,
  onLimitChange,
  onPageChange,
  onOpenCreate,
  onEdit,
  onDelete,
  onRetry,
}: SchedulesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-12 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        <AlertCircle className="mx-auto mb-2 size-8" />
        <p className="font-semibold">Gagal memuat jadwal pelajaran</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Periksa koneksi jaringan dan pastikan backend API berjalan.
        </p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Coba lagi
        </Button>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <Calendar className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Belum ada jadwal pelajaran
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mulai tambahkan jadwal kegiatan belajar mengajar untuk kelas dan ruangan.
        </p>
        <Button
          type="button"
          onClick={onOpenCreate}
          className="mt-5 h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="mr-2 size-4" /> Tambah Jadwal
        </Button>
      </div>
    );
  }

  const start = meta.totalData === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1;
  const end = Math.min(meta.currentPage * meta.perPage, meta.totalData);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Hari</th>
              <th className="px-5 py-3.5">Jam / Waktu</th>
              <th className="px-5 py-3.5">Kelas</th>
              <th className="px-5 py-3.5">Mata Pelajaran</th>
              <th className="px-5 py-3.5">Guru Pengampu</th>
              <th className="px-5 py-3.5">Ruangan</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {schedules.map((schedule) => {
              const dayBadge = getDayBadgeColor(schedule.day);
              const timeDisplay = formatTimeRange(
                schedule.startTime,
                schedule.endTime,
              );
              const className =
                schedule.classSubject?.class?.name || "Kelas -";
              const subjectName =
                schedule.classSubject?.subject?.name || "Mata Pelajaran -";
              const subjectCode = schedule.classSubject?.subject?.code;
              const teacherName =
                schedule.classSubject?.teacher?.profile?.fullName ||
                schedule.classSubject?.teacher?.teacher_number ||
                "—";
              const roomDisplay = schedule.classroom
                ? `${schedule.classroom.roomName} (${schedule.classroom.roomCode})`
                : "—";
              const buildingInfo = schedule.classroom?.building
                ? schedule.classroom.building
                : null;

              return (
                <tr
                  key={schedule.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Hari */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${dayBadge}`}
                    >
                      {schedule.day}
                    </span>
                  </td>

                  {/* Jam */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="size-4 text-slate-400 shrink-0" />
                      <span>{timeDisplay}</span>
                    </div>
                  </td>

                  {/* Kelas */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                      <GraduationCap className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{className}</span>
                    </div>
                  </td>

                  {/* Mata Pelajaran */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {subjectName}
                      </p>
                      {subjectCode && (
                        <span className="font-mono text-[11px] text-slate-400">
                          {subjectCode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Guru Pengampu */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                        <User className="size-3.5" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {teacherName}
                      </span>
                    </div>
                  </td>

                  {/* Ruangan */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <DoorOpen className="size-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-medium">{roomDisplay}</p>
                        {buildingInfo && (
                          <p className="text-[11px] text-slate-400">
                            {buildingInfo}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                        className="h-8 gap-1.5 text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400"
                      >
                        <Edit2 className="size-3.5" /> Ubah
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(schedule)}
                        className="h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="size-3.5" /> Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 sm:flex-row">
        <div className="flex items-center gap-4">
          <span>
            Menampilkan {start}-{end} dari {meta.totalData} jadwal terdaftar
          </span>
          <label className="flex items-center gap-1.5">
            Per halaman:
            <Select
              value={String(limit)}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-7 w-16 text-xs"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={meta.currentPage <= 1}
            onClick={() => onPageChange(meta.currentPage - 1)}
            className="h-7 px-2.5 text-xs"
          >
            Sebelumnya
          </Button>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Halaman {meta.currentPage} dari {Math.max(meta.totalPages, 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={meta.currentPage >= meta.totalPages}
            onClick={() => onPageChange(meta.currentPage + 1)}
            className="h-7 px-2.5 text-xs"
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
