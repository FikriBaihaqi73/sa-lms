import { Award, BookOpenCheck, GraduationCap, UserCheck } from "lucide-react";
import React from "react";
import type { StudyResultStats } from "../types";

interface StudyResultsStatsProps {
  stats: StudyResultStats;
  isLoading?: boolean;
}

export const StudyResultsStats: React.FC<StudyResultsStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Rekap Nilai */}
      <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:shadow dark:border-blue-900/50 dark:bg-slate-900">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Rekap Nilai
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isLoading ? "..." : stats.totalRecords.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <GraduationCap className="size-5" />
        </div>
      </div>

      {/* 2. Rata-rata IPK */}
      <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-4 shadow-sm transition hover:shadow dark:border-purple-900/50 dark:bg-slate-900">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Rata-rata IPK Kumulatif
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isLoading ? "..." : stats.averageCumulativeGpa.toFixed(2)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
          <Award className="size-5" />
        </div>
      </div>

      {/* 3. Rata-rata IPS */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow dark:border-emerald-900/50 dark:bg-slate-900">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Rata-rata IPS Semester
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isLoading ? "..." : stats.averageSemesterGpa.toFixed(2)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <BookOpenCheck className="size-5" />
        </div>
      </div>

      {/* 4. Siswa Aktif */}
      <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow dark:border-amber-900/50 dark:bg-slate-900">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Siswa Status Aktif
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isLoading ? "..." : stats.activeStudentsCount.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <UserCheck className="size-5" />
        </div>
      </div>
    </div>
  );
};
