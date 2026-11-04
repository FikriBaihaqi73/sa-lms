import React from "react";
import { Plus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceHeaderProps {
  onOpenCreateModal: () => void;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            Presensi & Absensi Siswa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Pantau, catat, dan rekap data kehadiran siswa per kelas dan jadwal pelajaran.
          </p>
        </div>
      </div>
      <div>
        <Button
          onClick={onOpenCreateModal}
          className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Presensi</span>
        </Button>
      </div>
    </div>
  );
};

