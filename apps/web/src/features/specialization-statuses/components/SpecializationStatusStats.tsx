import { Award, BookOpen, GraduationCap, Layers } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Specialization } from '../types';

interface SpecializationStatusStatsProps {
  statuses: Specialization[];
  isLoading: boolean;
}

const cardClass =
  'flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900';
const labelClass =
  'font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';

function StatCard({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-2">
        <p className={labelClass}>{label}</p>
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          {icon}
        </span>
      </div>
      {children}
    </div>
  );
}

export function SpecializationStatusStats({ statuses, isLoading }: SpecializationStatusStatsProps) {
  const total = statuses.length;
  const num = (n: number) => (isLoading ? '...' : n);
  const sampleNames = statuses.slice(0, 3).map((s) => s.name).join(', ') || '-';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Peminatan" icon={<Layers className="size-5" />}>
        <p className="text-3xl font-bold tracking-tight">
          {num(total)} <span className="text-sm font-medium text-slate-500">Bidang</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Peminatan studi aktif terdaftar di sistem.
        </p>
      </StatCard>

      <StatCard label="Peminatan Terdaftar" icon={<BookOpen className="size-5" />}>
        <p className="truncate text-base font-bold text-slate-800 dark:text-slate-100">
          {sampleNames}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {total > 3 ? `+${total - 3} peminatan lainnya` : 'Semua peminatan aktif tertera'}
        </p>
      </StatCard>

      <StatCard label="Integrasi Pengajar" icon={<GraduationCap className="size-5" />}>
        <p className="text-3xl font-bold tracking-tight text-blue-700 dark:text-blue-400">
          Terhubung
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dapat dipilih saat pendaftaran Guru &amp; Dosen.
        </p>
      </StatCard>

      <StatCard label="Kategori Keahlian" icon={<Award className="size-5" />}>
        <p className="text-3xl font-bold tracking-tight">
          {num(total)} <span className="text-sm font-medium text-slate-500">Kompetensi</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Siap digunakan untuk pemetaan kurikulum.
        </p>
      </StatCard>
    </div>
  );
}
