import { attendanceStatusKind } from "@repo/shared/utils/attendance-calendar";
import { UserCheck } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAttendanceMatrixOptions, useAttendancesMatrix, useBulkUpsertAttendance, useUpsertAttendance } from "../hooks";
import type { MatrixFilters, UpsertAttendanceInput } from "../types";
import { AttendanceFilter } from "./attendance-filter";
import { matrixView } from "./attendance-matrix-model";
import { AttendanceMatrixTable } from "./attendance-matrix-table";
import { AttendanceNotePopover } from "./attendance-note-popover";
import { AttendanceStats } from "./attendance-stats";

function initialFilters(): MatrixFilters {
  const now = new Date();
  return { search: "", academicYearId: "", classId: "", scheduleId: "", statusId: "", month: now.getMonth() + 1, year: now.getFullYear() };
}

export function AttendancesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [editing, setEditing] = useState<{ input: UpsertAttendanceInput; name: string } | null>(null);
  const [notice, setNotice] = useState<{ error: boolean; message: string } | null>(null);
  const options = useAttendanceMatrixOptions();
  const matrix = useAttendancesMatrix({ schedule_id: filters.scheduleId, month: filters.month, year: filters.year });
  const upsert = useUpsertAttendance();
  const bulk = useBulkUpsertAttendance();
  const search = useDebounce(filters.search);
  const view = matrixView(matrix.data, search, filters.statusId);
  const present = options.data?.statuses.find((status) => attendanceStatusKind(status.name) === "present");
  const busy = upsert.isPending || bulk.isPending;
  const schedule = matrix.data?.schedule;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayActive = matrix.data?.dates.some((date) => date.date === today && date.active);
  const updateFilters = (next: MatrixFilters) => { setFilters(next); setEditing(null); setNotice(null); };
  const setAllPresent = async (date: string) => {
    if (!present || !schedule) return;
    setNotice(null);
    try {
      const records = await bulk.mutateAsync({ schedule_id: schedule.id, attendance_date: date, attendance_status_id: present.id });
      setNotice({ error: false, message: `${records.length} siswa berhasil ditandai hadir pada ${date}.` });
    } catch (cause) { setNotice({ error: true, message: cause instanceof Error ? cause.message : "Gagal menyimpan presensi kelas." }); }
  };
  return <main className="min-h-[calc(100vh-4rem)] min-w-0 bg-[#0b1120] p-4 text-slate-100 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400"><UserCheck className="size-6" /></div><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold sm:text-2xl">Presensi & Absensi Siswa</h1><span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">Overview & Matrix Report</span></div><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Laporan real-time dan matriks kehadiran siswa otomatis per kelas, jadwal mata pelajaran, dan periode bulan.</p></div></div>
        <div className="space-y-2"><div className="rounded-lg border border-[#1e293b] bg-[#131c2e] px-3 py-2 text-xs text-slate-400">{schedule ? `${schedule.day} ? ${schedule.classSubject?.subject?.name} ? ${schedule.classroom?.roomName ?? "Ruang belum tersedia"}` : "Pilih kelas dan jadwal untuk memulai"}</div><button type="button" disabled={busy || !present || !todayActive || !matrix.data?.students.length} title="Aktif hanya jika hari ini sesuai jadwal dan periode terpilih" onClick={() => void setAllPresent(today)} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{bulk.isPending ? "Menyimpan?" : "Set Semua Hadir (Hari Aktif)"}</button></div>
      </header>
      <AttendanceStats summary={view.summary} loading={matrix.isFetching && Boolean(filters.scheduleId)} />
      <AttendanceFilter filters={filters} options={options.data} onChange={updateFilters} onReset={() => updateFilters(initialFilters())} />
      {notice && <p role={notice.error ? "alert" : "status"} className="rounded-lg border border-[#1e293b] bg-[#131c2e] p-3 text-sm">{notice.message}</p>}
      {(options.isError || matrix.isError) ? <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-6"><p>{options.error?.message ?? matrix.error?.message}</p><button type="button" onClick={() => { if (options.isError) void options.refetch(); if (matrix.isError) void matrix.refetch(); }} className="mt-3 rounded-lg border border-red-400/50 px-3 py-2">Coba lagi</button></div>
        : options.isPending || (filters.scheduleId && matrix.isPending) ? <p role="status" className="p-12 text-center text-slate-400">Memuat matriks kehadiran?</p>
        : !matrix.data ? <div className="rounded-xl border border-[#1e293b] bg-[#131c2e] p-16 text-center"><UserCheck className="mx-auto mb-4 size-10 text-blue-400" /><h2 className="font-semibold">Siap mencatat kehadiran</h2><p className="mt-2 text-sm text-slate-400">Pilih kelas dan jadwal. Seluruh siswa akan muncul otomatis.</p></div>
        : <AttendanceMatrixTable matrix={matrix.data} view={view} busy={busy} canBulk={Boolean(present)} onBulk={(date) => void setAllPresent(date)} onEdit={(student, date, record) => setEditing({ name: student.profile?.fullName ?? student.studentNumber ?? "Siswa", input: { schedule_id: matrix.data.schedule.id, student_id: student.id, attendance_date: date, attendance_status_id: record?.attendance_status_id ?? "", notes: record?.notes ?? "" } })} />}
      {schedule && !present && <p className="text-sm text-amber-400">Status Hadir belum tersedia. Tambahkan melalui pengaturan Status Kehadiran untuk menggunakan Set Semua Hadir.</p>}
    </div>
    {editing && <AttendanceNotePopover key={`${editing.input.student_id}:${editing.input.attendance_date}`} initial={editing.input} studentName={editing.name} statuses={options.data?.statuses ?? []} onClose={() => setEditing(null)} onSave={async (input) => { await upsert.mutateAsync(input); setNotice({ error: false, message: "Presensi berhasil disimpan." }); }} />}
  </main>;
}
