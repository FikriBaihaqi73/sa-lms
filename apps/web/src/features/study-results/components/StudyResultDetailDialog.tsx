import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  User,
  X,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import type { DepartmentOption, StudyResult } from "../types";

interface StudyResultDetailDialogProps {
  open: boolean;
  result: StudyResult | null;
  departments: DepartmentOption[];
  onClose: () => void;
  onEdit: (result: StudyResult) => void;
}

export const StudyResultDetailDialog: React.FC<StudyResultDetailDialogProps> = ({
  open,
  result,
  departments,
  onClose,
  onEdit,
}) => {
  if (!open || !result) return null;

  const deptMap = new Map<string, string>();
  for (const d of departments) {
    deptMap.set(d.id, `${d.name} (${d.code})`);
  }

  const studentName =
    result.student?.profile?.fullName || "Nama Siswa Tidak Diketahui";
  const studentNumber = result.student?.studentNumber || "-";
  const studentEmail = result.student?.profile?.email || "-";
  const classList = result.student?.classStudents
    ?.map((cs) => cs.classes?.name)
    .filter(Boolean);
  const classDisplay =
    classList && classList.length > 0 ? classList.join(", ") : "-";
  const deptDisplay = result.student?.departmentId
    ? deptMap.get(result.student.departmentId) || "-"
    : "-";

  const numSgpa =
    result.semesterGpa !== null && result.semesterGpa !== undefined
      ? Number(result.semesterGpa).toFixed(2)
      : "-";
  const numCgpa =
    result.cumulativeGpa !== null && result.cumulativeGpa !== undefined
      ? Number(result.cumulativeGpa).toFixed(2)
      : "-";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-dialog-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h2
                id="detail-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg"
              >
                Rincian Rekap Nilai Siswa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kartu Hasil Studi (KHS) dan pencapaian akademik per semester.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup dialog detail"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6 text-xs sm:text-sm">
          {/* Student Profile Card */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <User className="size-4 text-blue-600 dark:text-blue-400" />
              <span>Profil Siswa</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-400">Nama Lengkap</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {studentName}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Nomor Induk Siswa (NIS)</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {studentNumber}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Kelas</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {classDisplay}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Departemen</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {deptDisplay}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Email</p>
                <p className="font-medium text-slate-600 dark:text-slate-300">
                  {studentEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Period */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
              <span>Periode Akademik</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-400">Tahun Ajaran</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {result.academicYear?.academic_year || "-"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Semester</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {result.semester?.name || "-"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Status Akademik</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {result.academicStatus?.name || "Aktif"}
                </p>
              </div>
            </div>
          </div>

          {/* GPA & Credits recap */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[11px] font-medium text-slate-500">Beban SKS</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                {result.totalCredits ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                IPS Semester
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-800 dark:text-emerald-300">
                {numSgpa}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center dark:border-blue-900/50 dark:bg-blue-950/20">
              <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400">
                IPK Kumulatif
              </p>
              <p className="mt-1 text-xl font-bold text-blue-800 dark:text-blue-300">
                {numCgpa}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 p-4 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold"
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose();
              onEdit(result);
            }}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
          >
            Ubah Data
          </Button>
        </div>
      </div>
    </div>
  );
};
