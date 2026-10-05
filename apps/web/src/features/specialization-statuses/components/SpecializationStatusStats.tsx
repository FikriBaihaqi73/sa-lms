import { Bot, ClipboardCheck, Layers, ShieldCheck, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SpecializationStatus } from '../types';

interface SpecializationStatusStatsProps {
  statuses: SpecializationStatus[];
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

const names = (items: SpecializationStatus[]) => items.map((i) => i.name.split(' / ')[0]).join(', ') || '-';

export function SpecializationStatusStats({ statuses, isLoading }: SpecializationStatusStatsProps) {
  const total = statuses.length;
  const custom = statuses.filter((s) => s.type === 'custom').length;
  const standard = total - custom;
  const withKrs = statuses.filter((s) => s.access?.krs.enabled);
  const special = statuses.filter((s) => s.billingSpecial);
  const standardPct = total > 0 ? Math.round((standard / total) * 100) : 0;
  const num = (n: number) => (isLoading ? '...' : n);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Status Terdaftar" icon={<Layers className="size-5" />}>
        <p className="text-3xl font-bold tracking-tight">
          {num(total)} <span className="text-sm font-medium text-slate-500">Status</span>
        </p>
        <div className="space-y-2">
          <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-blue-700" />{standard} Standar PD-DIKTI</span>
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-sky-400" />{custom} Kustom</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sky-200 dark:bg-sky-900/60">
            <div className="h-full rounded-full bg-blue-700" style={{ width: `${standardPct}%` }} />
          </div>
        </div>
      </StatCard>

      <StatCard label="Status Berhak KRS" icon={<ClipboardCheck className="size-5" />}>
        <p className="text-3xl font-bold tracking-tight">
          {num(withKrs.length)} <span className="text-sm font-medium text-slate-500">Status Aktif Hak</span>
        </p>
        <p className="truncate text-xs text-slate-600 dark:text-slate-300">{names(withKrs)}</p>
        <p className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="size-3.5 text-blue-600" /> Validasi prasyarat UKT &amp; IPK aktif
        </p>
      </StatCard>

      <StatCard label="Bebas / Tangguh Tagihan" icon={<Wallet className="size-5" />}>
        <p className="text-3xl font-bold tracking-tight">
          {num(special.length)} <span className="text-sm font-medium text-slate-500">Kebijakan Khusus</span>
        </p>
        <p className="truncate text-xs text-slate-600 dark:text-slate-300">{names(special)}</p>
        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
          Otomatis potong billing invoice 0-50%
        </p>
      </StatCard>

      <StatCard label="Evaluasi Otomasi (DO/Mangkir)" icon={<Bot className="size-5" />}>
        <p className="flex items-center gap-2 text-3xl font-bold tracking-tight text-blue-700 dark:text-blue-400">
          ONLINE
          <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            CRON
          </span>
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Toleransi: <strong>2 semester mangkir berturut-turut</strong> &amp; evaluasi IPK semester 4.
        </p>
        <p className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
          <span>Jadwal Trigger: Akhir Semester</span>
          <span className="text-blue-600 dark:text-blue-400">Auto-Sync On</span>
        </p>
      </StatCard>
    </div>
  );
}
