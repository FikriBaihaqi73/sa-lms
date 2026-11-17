import { CalendarDays, Plus } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

export const ExaminationHeader: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400">
        <CalendarDays className="size-6" />
      </div>
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          DATA AKADEMIK • MANAJEMEN UJIAN
        </span>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Ujian</h1>
        <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">Kelola jadwal dan informasi ujian pada setiap mata pelajaran kelas.</p>
      </div>
    </div>
    <Button type="button" onClick={onAdd} className="shrink-0 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500">
      <Plus className="size-3.5" /> Tambah Ujian
    </Button>
  </div>
);
