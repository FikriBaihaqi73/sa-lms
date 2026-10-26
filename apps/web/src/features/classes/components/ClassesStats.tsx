import { GraduationCap, ListChecks, School } from "lucide-react";

interface ClassesStatsProps {
  total?: number;
  visibleCount: number;
  page?: number;
  totalPages?: number;
  isLoading: boolean;
}

const cardClass = "flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export function ClassesStats({ total, visibleCount, page, totalPages, isLoading }: ClassesStatsProps) {
  const value = (number: number) => (isLoading ? "..." : number.toLocaleString("id-ID"));
  const safePage = Math.max(page ?? 1, 1);
  const safeTotalPages = Math.max(totalPages ?? 1, 1);
  const totalLabel = total !== undefined && total >= 0 ? value(total) : isLoading ? "..." : "Tidak tersedia";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className={cardClass}>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400"><School className="size-5" /></div>
        <div><p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Kelas</p><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalLabel}</p></div>
      </div>
      <div className={cardClass}>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-400"><ListChecks className="size-5" /></div>
        <div><p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Tampil Saat Ini</p><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value(visibleCount)}</p><p className="text-[11px] text-slate-400 dark:text-slate-500">sesuai halaman dan pencarian</p></div>
      </div>
      <div className={cardClass}>
        <div className="rounded-lg border border-violet-100 bg-violet-50 p-3 text-violet-600 dark:border-violet-900/50 dark:bg-violet-950/60 dark:text-violet-400"><GraduationCap className="size-5" /></div>
        <div><p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Halaman</p><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isLoading ? "..." : `${safePage} / ${safeTotalPages}`}</p></div>
      </div>
    </div>
  );
}
