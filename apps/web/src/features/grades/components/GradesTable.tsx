import { Pencil } from "lucide-react";
import { calcFinalScore, gradePredicate, gradeStatus } from "../types";
import type { GradeRow } from "../types";

interface Props { rows: GradeRow[]; totalCount: number; isLoading: boolean; onEdit: (r: GradeRow) => void; }

const tone: Record<GradeRow["avatarTone"], string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
};

function score(v: number | null) {
  if (v == null) return <span className="italic text-slate-400">-</span>;
  return <span className="font-semibold text-slate-900 dark:text-slate-100">{v}</span>;
}

export function GradesTable({ rows, totalCount, isLoading, onEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3.5">Siswa</th>
              <th className="px-4 py-3.5 text-center">Tugas (30%)</th>
              <th className="px-4 py-3.5 text-center">UTS (30%)</th>
              <th className="px-4 py-3.5 text-center">UAS (40%)</th>
              <th className="px-4 py-3.5 text-center">Nilai Akhir</th>
              <th className="px-4 py-3.5">Predikat</th>
              <th className="px-4 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Memuat data nilai...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Belum ada data nilai untuk filter ini.</td></tr>
            ) : (
              rows.map((r) => {
                const final = calcFinalScore(r);
                const st = gradeStatus(final);
                return (
                  <tr key={r.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold ${tone[r.avatarTone]}`}>{r.initials}</span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{r.studentName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{r.studentNumber} - {r.subjectCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">{score(r.tugas)}</td>
                    <td className="px-4 py-4 text-center">{score(r.uts)}</td>
                    <td className="px-4 py-4 text-center">{score(r.uas)}</td>
                    <td className="px-4 py-4 text-center">
                      {final == null ? <span className="italic text-slate-400">-</span> :
                        <span className="font-bold text-slate-900 dark:text-slate-100">{final.toFixed(1)}</span>}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">{gradePredicate(final)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        st === "Lulus" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : st === "Remedial" ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{st}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" onClick={() => onEdit(r)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50">
                        <Pencil className="size-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Menampilkan {rows.length} dari {totalCount} data nilai.
      </div>
    </div>
  );
}
