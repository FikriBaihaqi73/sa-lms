import { Download, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AcademicStatusHeaderProps {
  onAdd: () => void;
}

export function AcademicStatusHeader({ onAdd }: AcademicStatusHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
      <div className="max-w-2xl">
        <nav className="text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
          Master Akademik <span className="mx-1">›</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Status Akademik</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Status Akademik Mahasiswa</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            <span className="size-1.5 rounded-full bg-blue-600" /> Superadmin / Global Config
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Kelola status registrasi akademik, aturan validasi KRS, skema penagihan UKT/BPP, serta
          pemetaan agregat sinkronisasi berkala PD-DIKTI secara terpusat untuk multi-kampus.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-10 border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Download className="mr-1.5 size-4" /> Export Standar PD-DIKTI
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <SlidersHorizontal className="mr-1.5 size-4" /> Aturan Otomasi Status
        </Button>
        <Button
          type="button"
          onClick={onAdd}
          className="h-10 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="mr-1.5 size-4" /> Tambah Status Baru
        </Button>
      </div>
    </header>
  );
}
