import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpecializationStatusHeaderProps {
  onAdd: () => void;
}

export function SpecializationStatusHeader({ onAdd }: SpecializationStatusHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
      <div className="max-w-2xl">
        <nav className="text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
          Master Data Global <span className="mx-1">›</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Peminatan &amp; Konsentrasi
          </span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Peminatan &amp; Bidang Keahlian
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            <span className="size-1.5 rounded-full bg-blue-600" /> Specializations
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Kelola program peminatan, bidang keahlian pengajar/dosen, serta konsentrasi keilmuan
          kurikulum akademik secara terpusat.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
        <Button
          type="button"
          onClick={onAdd}
          className="h-10 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="mr-1.5 size-4" /> Tambah Peminatan
        </Button>
      </div>
    </header>
  );
}
