import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StudentHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenCreate: () => void;
}

export function StudentHeader({ searchTerm, onSearchChange, onOpenCreate }: StudentHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Users className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Student Directory</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Students</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola data mahasiswa pada institusi Anda.</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <label className="relative min-w-0 sm:w-72">
          <span className="sr-only">Cari student</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama, NIM, email..."
            className="h-10 pl-9"
          />
        </label>
        <Button type="button" onClick={onOpenCreate} className="h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
          <Plus className="mr-2 size-4" /> Tambah Student
        </Button>
      </div>
    </div>
  );
}

