import { Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GradesHeaderProps {
  onAdd: () => void;
}

export function GradesHeader({ onAdd }: GradesHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
          <Award className="size-3.5" /> Konfigurasi Akademik
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Standar Penilaian
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Atur dan kelola rentang standar penilaian (skala nilai & rubrik) sebagai acuan batas nilai minimum, maksimum, serta predikat capaian pembelajaran.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onAdd}
          className="h-10 gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 font-semibold text-white shadow-md hover:from-blue-800 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-500"
        >
          <Plus className="size-4" /> Tambah Standar Nilai
        </Button>
      </div>
    </header>
  );
}
