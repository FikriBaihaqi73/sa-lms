import { Award, BarChart3, CircleCheckBig, CircleAlert } from "lucide-react";

interface Props { total: number; average: number; passed: number; remedial: number; isLoading: boolean; }

export function GradesStats({ total, average, passed, remedial, isLoading }: Props) {
  const cards = [
    { icon: BarChart3, tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400", value: isLoading ? "..." : String(total), label: "Total Siswa" },
    { icon: Award, tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400", value: isLoading ? "..." : average.toFixed(1), label: "Rata-rata Kelas" },
    { icon: CircleCheckBig, tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300", value: isLoading ? "..." : String(passed), label: "Lulus (KKM 70)" },
    { icon: CircleAlert, tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400", value: isLoading ? "..." : String(remedial), label: "Perlu Remedial" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className={`grid size-12 place-items-center rounded-xl ${c.tone}`}>
            <c.icon className="size-6" />
          </span>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
