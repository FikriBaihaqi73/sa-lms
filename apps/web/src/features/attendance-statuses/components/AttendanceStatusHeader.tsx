import { ClipboardCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttendanceStatusHeaderProps {
  onAdd: () => void;
}

export function AttendanceStatusHeader({ onAdd }: AttendanceStatusHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
          <ClipboardCheck className="size-3.5" /> Settings Portal
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Attendance Statuses</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Kelola status kehadiran sebagai referensi pencatatan presensi akademik.
        </p>
      </div>
      <Button
        type="button"
        onClick={onAdd}
        className="h-10 bg-blue-700 px-4 text-sm font-semibold hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        <Plus className="mr-1.5 size-4" /> Tambah Status Kehadiran
      </Button>
    </header>
  );
}
