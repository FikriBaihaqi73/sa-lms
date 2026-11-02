import {
  CalendarDays,
  Clock,
  DoorOpen,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { Schedule } from "../types";

interface SchedulesStatsProps {
  schedules: Schedule[];
  totalData: number;
  isLoading: boolean;
}

interface StatCardItem {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  colorClass: {
    bg: string;
    border: string;
    text: string;
    darkBg: string;
    darkBorder: string;
    darkText: string;
  };
}

export function SchedulesStats({
  schedules,
  totalData,
  isLoading,
}: SchedulesStatsProps) {
  // Aggregate stats from current items
  const activeDaysCount = new Set(
    schedules.map((s) => s.day.trim().toLowerCase()),
  ).size;
  const classesCount = new Set(
    schedules.map((s) => s.classSubject?.class?.id || s.classSubject?.class_id).filter(Boolean),
  ).size;
  const roomsCount = new Set(
    schedules.map((s) => s.classroomId).filter(Boolean),
  ).size;

  const statCards: StatCardItem[] = [
    {
      label: "TOTAL JADWAL",
      value: totalData,
      subtext: "Jadwal terdaftar",
      icon: Clock,
      colorClass: {
        bg: "bg-blue-50",
        border: "border-blue-100",
        text: "text-blue-600",
        darkBg: "dark:bg-blue-950/60",
        darkBorder: "dark:border-blue-900/50",
        darkText: "dark:text-blue-400",
      },
    },
    {
      label: "HARI AKTIF",
      value: activeDaysCount,
      subtext: "Hari kegiatan KBM",
      icon: CalendarDays,
      colorClass: {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        text: "text-emerald-600",
        darkBg: "dark:bg-emerald-950/60",
        darkBorder: "dark:border-emerald-900/50",
        darkText: "dark:text-emerald-400",
      },
    },
    {
      label: "KELAS TERJADWAL",
      value: classesCount,
      subtext: "Kelas memiliki jadwal",
      icon: GraduationCap,
      colorClass: {
        bg: "bg-purple-50",
        border: "border-purple-100",
        text: "text-purple-600",
        darkBg: "dark:bg-purple-950/60",
        darkBorder: "dark:border-purple-900/50",
        darkText: "dark:text-purple-400",
      },
    },
    {
      label: "RUANGAN DIGUNAKAN",
      value: roomsCount,
      subtext: "Ruang kelas aktif",
      icon: DoorOpen,
      colorClass: {
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-600",
        darkBg: "dark:bg-amber-950/60",
        darkBorder: "dark:border-amber-900/50",
        darkText: "dark:text-amber-400",
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const { bg, border, text, darkBg, darkBorder, darkText } =
          card.colorClass;
        return (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              className={`rounded-lg border ${border} ${bg} p-3 ${text} ${darkBorder} ${darkBg} ${darkText}`}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                {isLoading ? "..." : card.value}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
