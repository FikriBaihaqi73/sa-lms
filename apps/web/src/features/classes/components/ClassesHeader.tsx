import { Plus, Search, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ClassesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenCreate: () => void;
}

export function ClassesHeader({ searchTerm, onSearchChange, onOpenCreate }: ClassesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <School className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Direktori Kelas</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Kelas</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola data kelas pada institusi Anda.</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <label className="relative min-w-0 sm:w-80">
          <span className="sr-only">Cari kelas</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Cari nama kelas, institusi..." className="h-10 pl-9" />
        </label>
        <Button type="button" onClick={onOpenCreate} className="h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
          <Plus className="mr-2 size-4" /> Tambah Kelas
        </Button>
      </div>
    </div>
  );
}
