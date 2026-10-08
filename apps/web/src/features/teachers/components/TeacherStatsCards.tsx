import { AlertCircle, BookOpenCheck, Layers, UserRound, UsersRound } from "lucide-react";
import type { TeacherStats } from "../types";

interface TeacherStatsCardsProps {
  stats?: TeacherStats;
  isLoading: boolean;
  isError: boolean;
}

const cardClass =
  "flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900";

function StatValue({ loading, children }: { loading: boolean; children: string }) {
  return (
    <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
      {loading ? "..." : children}
    </p>
  );
}

export function TeacherStatsCards({ stats, isLoading, isError }: TeacherStatsCardsProps) {
  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        <AlertCircle className="size-5 shrink-0" />
        <p>
          Statistik guru tidak tersedia. Pastikan endpoint{" "}
          <code className="rounded bg-red-100 px-1 font-mono text-xs dark:bg-red-900/40">
            GET /teachers/stats
          </code>{" "}
          aktif.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={cardClass}>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
          <UsersRound className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Guru
          </p>
          <StatValue loading={isLoading}>{(stats?.total ?? 0).toLocaleString("id-ID")}</StatValue>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            {isLoading
              ? "Memuat..."
              : `${(stats?.tetapCount ?? 0).toLocaleString("id-ID")} tetap · ${(stats?.honorerCount ?? 0).toLocaleString("id-ID")} honorer`}
          </p>
        </div>
      </div>
      <div className={cardClass}>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-400">
          <BookOpenCheck className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Spesialisasi
          </p>
          <StatValue loading={isLoading}>
            {(stats?.specializationCount ?? 0).toLocaleString("id-ID")}
          </StatValue>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            bidang mata pelajaran
          </p>
        </div>
      </div>
      <div className={cardClass}>
        <div className="rounded-lg border border-violet-100 bg-violet-50 p-3 text-violet-600 dark:border-violet-900/50 dark:bg-violet-950/60 dark:text-violet-400">
          <Layers className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Kelas Diampu
          </p>
          <StatValue loading={isLoading}>
            {(stats?.totalClassAssignments ?? 0).toLocaleString("id-ID")}
          </StatValue>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            total penugasan kelas
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50/70 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
        <div className="rounded-lg border border-red-200 bg-white p-3 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          <UserRound className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-red-500 dark:text-red-400">
            Belum ada kelas
          </p>
          <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
            {isLoading ? "..." : (stats?.unassignedCount ?? 0).toLocaleString("id-ID")}
          </p>
          <p className="mt-0.5 text-[11px] text-red-500/90 dark:text-red-400/90">
            guru perlu di-assign
          </p>
        </div>
      </div>
    </div>
  );
}
