import { ClipboardCheck, Layers, ShieldCheck } from 'lucide-react';

interface AttendanceStatusStatsProps {
  total: number;
  isLoading: boolean;
}

export function AttendanceStatusStats({ total, isLoading }: AttendanceStatusStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
          <Layers className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Status</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isLoading ? '...' : total}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-400">
          <ClipboardCheck className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Referensi Presensi</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Siap digunakan</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Scope Akses</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Settings Global</p>
        </div>
      </div>
    </div>
  );
}
