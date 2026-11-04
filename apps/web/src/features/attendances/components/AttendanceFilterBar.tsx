import React from "react";
import { Calendar, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { useAttendanceStatuses } from "@/features/attendance-statuses/hooks/useAttendanceStatuses";

interface AttendanceFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  classId: string;
  onClassIdChange: (value: string) => void;
  statusId: string;
  onStatusIdChange: (value: string) => void;
  onReset: () => void;
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  search,
  onSearchChange,
  date,
  onDateChange,
  classId,
  onClassIdChange,
  statusId,
  onStatusIdChange,
  onReset,
}) => {
  const classesQuery = useClasses({ page: 1, limit: 100 });
  const statusesQuery = useAttendanceStatuses({ page: 1, limit: 100 });

  const classes = classesQuery.data?.data ?? [];
  const statuses = statusesQuery.data?.data ?? [];

  const hasActiveFilters = Boolean(search || date || classId || statusId);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, NISN, atau pelajaran..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            aria-label="Filter tanggal kehadiran"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={classId}
            onChange={(e) => onClassIdChange(e.target.value)}
            aria-label="Filter kelas"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.grade_level ? `(Tingkat ${c.grade_level})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <select
            value={statusId}
            onChange={(e) => onStatusIdChange(e.target.value)}
            aria-label="Filter status kehadiran"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
          >
            <option value="">Semua Status</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-9 shrink-0 gap-1.5 px-3 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              title="Reset Filter"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
