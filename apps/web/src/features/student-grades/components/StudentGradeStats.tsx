import { AlertCircle, Award, CheckCircle2, FileText, TriangleAlert } from "lucide-react";
import type React from "react";
import type { StudentGradeStats as StudentGradeStatsData } from "../types";

interface StudentGradeStatsProps { stats?: StudentGradeStatsData; isLoading: boolean; isError: boolean; }

export const StudentGradeStats: React.FC<StudentGradeStatsProps> = ({ stats, isLoading, isError }) => {
  if (isLoading) return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/95" />)}</div>;
  if (isError || !stats) return <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-300"><AlertCircle className="size-4" /> Statistik nilai siswa gagal dimuat. Silakan coba lagi.</div>;
  const cards = [
    { label: "TOTAL NILAI", value: stats.total, description: "Seluruh data nilai siswa di institusi ini", icon: FileText, color: "text-blue-600 dark:text-blue-400", box: "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-950/50" },
    { label: "NILAI LENGKAP", value: stats.complete, description: "Nilai akhir sudah terisi", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", box: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/50" },
    { label: "BELUM LENGKAP", value: stats.incomplete, description: "Nilai akhir belum diisi", icon: TriangleAlert, color: "text-amber-600 dark:text-amber-400", box: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/50" },
    { label: "RATA-RATA NILAI AKHIR", value: stats.averageFinalScore == null ? "-" : stats.averageFinalScore.toFixed(1), description: "Rata-rata dari nilai akhir yang terisi", icon: Award, color: "text-purple-600 dark:text-purple-400", box: "border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-950/50" },
  ];
  return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, description, icon: Icon, color, box }) => <div key={label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-black/20 dark:hover:border-slate-600"><div className="flex items-center justify-between"><span className={`text-[11px] font-bold uppercase tracking-wider ${color}`}>{label}</span><div className={`flex size-7 items-center justify-center rounded-lg border ${box} ${color}`}><Icon className="size-4" /></div></div><div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div><p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{description}</p></div>)}</div>;
};
