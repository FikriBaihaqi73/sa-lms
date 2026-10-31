import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SchedulesHeaderProps {
  onOpenCreate: () => void;
}

export function SchedulesHeader({ onOpenCreate }: SchedulesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Calendar className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Konfigurasi Akademik
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Jadwal Pelajaran
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Kelola alokasi jadwal kegiatan belajar mengajar, kelas, ruangan, dan guru pengampu.
        </p>
      </div>
      <Button
        type="button"
        onClick={onOpenCreate}
        className="bg-blue-700 font-semibold text-white shadow-sm hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        <Plus className="mr-2 size-4" /> Tambah Jadwal
      </Button>
    </div>
  );
}
