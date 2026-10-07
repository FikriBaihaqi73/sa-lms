import { BookOpen, Layers, CheckCircle2, Clock } from "lucide-react";
import type { AssignmentType } from "../types";

interface AssignmentTypeStatsProps {
  types: AssignmentType[];
  isLoading: boolean;
}

export function AssignmentTypeStats({ types, isLoading }: AssignmentTypeStatsProps) {
  const total = types.length;
  const withDesc = types.filter((t) => Boolean(t.description?.trim())).length;
  const withoutDesc = total - withDesc;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Tipe Tugas
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {isLoading ? "-" : total}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Lengkap Deskripsi
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {isLoading ? "-" : withDesc}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tanpa Deskripsi
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {isLoading ? "-" : withoutDesc}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Kategori Aktif
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              100%
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
