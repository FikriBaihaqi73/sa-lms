import { AlertCircle, CalendarCheck2, CalendarClock, FileQuestion } from "lucide-react";
import type React from "react";
import type { ExaminationStats as ExaminationStatsData } from "../types";

interface ExaminationStatsProps { stats?: ExaminationStatsData; isLoading: boolean; isError: boolean; }

export const ExaminationStats: React.FC<ExaminationStatsProps> = ({ stats, isLoading, isError }) => {
  if (isLoading) return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111927]/60" />)}</div>;
  if (isError || !stats) return <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-300"><AlertCircle className="size-4" /> Statistik ujian gagal dimuat. Silakan coba lagi.</div>;

  const cards = [
    { label: "TOTAL UJIAN", value: stats.total, description: "Seluruh ujian di institusi ini", icon: FileQuestion, color: "text-blue-600 dark:text-blue-400", box: "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-950/50" },
    { label: "AKAN DATANG", value: stats.upcoming, description: "Dijadwalkan setelah waktu sekarang", icon: CalendarClock, color: "text-emerald-600 dark:text-emerald-400", box: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/50" },
    { label: "SELESAI", value: stats.completed, description: "Sudah lewat waktu pelaksanaan", icon: CalendarCheck2, color: "text-purple-600 dark:text-purple-400", box: "border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-950/50" },
  ];
  return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">{cards.map(({ label, value, description, icon: Icon, color, box }) => <div key={label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700/80"><div className="flex items-center justify-between"><span className={`text-[11px] font-bold uppercase tracking-wider ${color}`}>{label}</span><div className={`flex size-7 items-center justify-center rounded-lg border ${box} ${color}`}><Icon className="size-4" /></div></div><div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p></div>)}</div>;
};
