import React from 'react';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UsersHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenCreateModal: () => void;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onOpenCreateModal,
}) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-600/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Superadmin Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          User Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Atur dan kelola akun pengguna seluruh sistem aplikasi.
        </p>
      </div>

      <Button
        onClick={onOpenCreateModal}
        className="bg-blue-600 font-medium text-white shadow-sm transition-all hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Tambah User
      </Button>
    </div>

    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder="Cari nama, email, role, atau institusi..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="border-slate-200 bg-slate-50 pl-9 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>
    </div>
  </div>
);
