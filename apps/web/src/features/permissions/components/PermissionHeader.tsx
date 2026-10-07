import React from 'react';
import { Plus, Search, ShieldCheck, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PermissionHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedModule: string;
  onModuleChange: (module: string) => void;
  availableModules: string[];
  onOpenCreateModal: () => void;
}

export const PermissionHeader: React.FC<PermissionHeaderProps> = ({
  searchTerm,
  onSearchChange,
  selectedModule,
  onModuleChange,
  availableModules,
  onOpenCreateModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Settings Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Permission Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Atur dan kelola hak akses (permissions) seluruh modul sistem aplikasi.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Add Permission Button */}
          <Button
            onClick={onOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Permission
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama atau modul permission..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500"
          />
        </div>

        {/* Module Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline-block" />
          <select
            value={selectedModule}
            onChange={(e) => onModuleChange(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-sm rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Modul</option>
            {availableModules.map((mod) => (
              <option key={mod} value={mod}>
                Modul: {mod}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
