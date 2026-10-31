import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SCHEDULE_DAYS } from "../schemas/scheduleSchema";
import type { ScheduleClassroomOption } from "../types";

interface SchedulesFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedDay: string;
  onDayChange: (value: string) => void;
  selectedClassroomId: string;
  onClassroomChange: (value: string) => void;
  classrooms: ScheduleClassroomOption[];
  onReset: () => void;
}

export function SchedulesFilterBar({
  search,
  onSearchChange,
  selectedDay,
  onDayChange,
  selectedClassroomId,
  onClassroomChange,
  classrooms,
  onReset,
}: SchedulesFilterBarProps) {
  const hasActiveFilters = Boolean(
    search || (selectedDay && selectedDay !== "all") || selectedClassroomId,
  );

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
      {/* Search Input */}
      <div className="relative">
        <span className="sr-only">Cari jadwal pelajaran</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari hari, kelas, mata pelajaran, guru, atau ruangan..."
          className="h-10 pl-9 text-sm"
        />
      </div>

      {/* Day Filter */}
      <div>
        <span className="sr-only">Filter hari</span>
        <Select
          value={selectedDay}
          onChange={(e) => onDayChange(e.target.value)}
          className="h-10 text-sm"
        >
          <option value="all">Semua Hari</option>
          {SCHEDULE_DAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>
      </div>

      {/* Classroom Filter */}
      <div>
        <span className="sr-only">Filter ruangan</span>
        <Select
          value={selectedClassroomId}
          onChange={(e) => onClassroomChange(e.target.value)}
          className="h-10 text-sm"
        >
          <option value="">Semua Ruangan</option>
          {classrooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.roomName} ({room.roomCode})
            </option>
          ))}
        </Select>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          title="Reset semua filter"
        >
          <RotateCcw className="mr-1.5 size-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}
