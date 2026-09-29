import React from 'react';
import { KeyRound, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Permission } from '../types';

interface PermissionStatsProps {
  permissions: Permission[];
}

export const PermissionStats: React.FC<PermissionStatsProps> = ({ permissions }) => {
  const totalCount = permissions.length;
  const uniqueModules = Array.from(new Set(permissions.map((p) => p.module))).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Permissions */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Permissions
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</p>
        </div>
      </div>

      {/* Card 2: Total Modules */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Modul
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{uniqueModules}</p>
        </div>
      </div>

      {/* Card 3: Scope */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Scope Akses
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Superadmin Global</p>
        </div>
      </div>

      {/* Card 4: System Health */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Status Sync
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Aktif & Terhubung</p>
        </div>
      </div>
    </div>
  );
};
