import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Percent,
  Users,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AttendanceSummary } from "../types";

interface AttendanceStatsProps {
  summary?: AttendanceSummary;
  isLoading?: boolean;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  summary,
  isLoading,
}) => {
  const stats = [
    {
      label: "Total Presensi",
      value: summary?.total ?? 0,
      icon: Users,
      color: "text-slate-600 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-800",
    },
    {
      label: "Hadir",
      value: summary?.present ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Izin",
      value: summary?.permission ?? 0,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Sakit",
      value: summary?.sick ?? 0,
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Alpa",
      value: summary?.absent ?? 0,
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      label: "Tingkat Kehadiran",
      value: `${summary?.attendanceRate ?? 0}%`,
      icon: Percent,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                {isLoading ? (
                  <div className="mt-1 h-5 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                ) : (
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

