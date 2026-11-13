import { attendanceStatusKind } from "@repo/shared/utils/attendance-calendar";
import type { AttendanceMatrix, AttendanceSummary } from "../types";

export function matrixView(matrix: AttendanceMatrix | undefined, search: string, statusId: string) {
  const term = search.trim().toLocaleLowerCase("id-ID");
  const activeDates = new Set(matrix?.dates.filter((date) => date.active).map((date) => date.date));
  const students = (matrix?.students ?? []).filter((student) => {
    const matchesSearch = `${student.profile?.fullName ?? ""} ${student.studentNumber ?? ""}`.toLocaleLowerCase("id-ID").includes(term);
    const matchesStatus = !statusId || matrix?.records.some((record) => record.student_id === student.id && record.attendance_status_id === statusId && activeDates.has(record.attendance_date?.slice(0, 10) ?? ""));
    return matchesSearch && matchesStatus;
  });
  const studentIds = new Set(students.map((student) => student.id));
  const records = (matrix?.records ?? []).filter((record) => studentIds.has(record.student_id) && activeDates.has(record.attendance_date?.slice(0, 10) ?? ""));
  const summary: AttendanceSummary = { total: records.length, present: 0, permission: 0, sick: 0, absent: 0, attendanceRate: 0 };
  for (const record of records) {
    const kind = attendanceStatusKind(record.attendance_status?.name);
    if (kind !== "unknown") summary[kind]++;
  }
  summary.attendanceRate = summary.total ? Math.round(summary.present / summary.total * 100) : 0;
  const cells = new Map(records.map((record) => [`${record.student_id}:${record.attendance_date?.slice(0, 10)}`, record]));
  const presentByDate = new Map<string, number>();
  for (const record of records) {
    const date = record.attendance_date?.slice(0, 10);
    if (date && attendanceStatusKind(record.attendance_status?.name) === "present") presentByDate.set(date, (presentByDate.get(date) ?? 0) + 1);
  }
  return { students, summary, cells, presentByDate };
}

export const statusAppearance = {
  present: { symbol: "✓", label: "Hadir", color: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" },
  permission: { symbol: "I", label: "Izin", color: "border-blue-500/30 bg-blue-500/15 text-blue-400" },
  sick: { symbol: "S", label: "Sakit", color: "border-amber-500/30 bg-amber-500/15 text-amber-400" },
  absent: { symbol: "×", label: "Alpa", color: "border-red-500/30 bg-red-500/15 text-red-400" },
  unknown: { symbol: "—", label: "Belum diisi / status lain", color: "border-slate-600 bg-slate-800 text-slate-400" },
};
