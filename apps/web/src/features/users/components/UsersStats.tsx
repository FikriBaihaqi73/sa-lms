import React from 'react';
import { CheckCircle2, ShieldCheck, UserCheck, UserRound, UserX } from 'lucide-react';
import type { User, UsersPageMeta } from '../types';

interface UsersStatsProps {
  users: User[];
  meta?: UsersPageMeta;
}

const cardClass = 'flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900';
const iconClass = 'rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400';

export const UsersStats: React.FC<UsersStatsProps> = ({ users, meta }) => {
  const activeCount = users.filter((user) => user.is_active).length;
  const inactiveCount = users.length - activeCount;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className={cardClass}>
        <div className={iconClass}><UserRound className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{meta?.total ?? 0}</p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-400"><UserCheck className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Users</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">di halaman ini</p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-red-600 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-400"><UserX className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Inactive Users</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{inactiveCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">di halaman ini</p>
        </div>
      </div>

      <div className={cardClass}>
        <div className={iconClass}><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Scope Akses</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Settings Global</p>
          <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-label="Aktif" />
        </div>
      </div>
    </div>
  );
};
