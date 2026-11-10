import { Link } from "@tanstack/react-router";
import { Plus, Search, Ticket, Users } from "lucide-react";
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
          <span className="text-xs font-bold uppercase tracking-wider">Direktori Siswa</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Data Siswa</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola data siswa pada institusi Anda.</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <div className="relative min-w-0 sm:w-72">
          <label htmlFor="student-search-input" className="sr-only">
            Cari siswa
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="student-search-input"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama, NIM, email..."
            className="h-10 pl-9"
          />
        </div>
        <Button
          asChild
          variant="outline"
          className="h-10 gap-2 border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Link to="/referral-codes">
            <Ticket className="size-4 text-blue-600 dark:text-blue-400" />
            Kode Referral
          </Link>
        </Button>
        <Button type="button" onClick={onOpenCreate} className="h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
          <Plus className="mr-2 size-4" /> Tambah Siswa
        </Button>
      </div>
    </div>
  );
}
