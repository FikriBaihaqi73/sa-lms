import {
  BellRing,
  CheckCircle2,
  FileEdit,
  Megaphone,
} from "lucide-react";
import type React from "react";
import type { AnnouncementStats } from "../types";

interface AnnouncementsStatsProps {
  stats?: AnnouncementStats;
  isLoading?: boolean;
}

export const AnnouncementsStats: React.FC<AnnouncementsStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  const cards = [
    {
      label: "Total Pengumuman",
      value: stats?.total ?? 0,
      description: "Seluruh arsip pengumuman",
      icon: Megaphone,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-100 dark:border-blue-900/40",
    },
    {
      label: "Diterbitkan",
      value: stats?.published ?? 0,
      description: "Dapat dilihat oleh audiens target",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-100 dark:border-emerald-900/40",
    },
    {
      label: "Draf",
      value: stats?.draft ?? 0,
      description: "Belum dipublikasikan",
      icon: FileEdit,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-100 dark:border-amber-900/40",
    },
    {
      label: "Pengumuman Aktif",
      value: stats?.active ?? 0,
      description: "Terbit dan belum kedaluwarsa",
      icon: BellRing,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-100 dark:border-purple-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`flex items-center justify-between rounded-2xl border ${card.border} bg-white p-4 shadow-sm transition hover:shadow dark:bg-slate-900`}
          >
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {isLoading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                ) : (
                  card.value
                )}
              </h3>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                {card.description}
              </p>
            </div>
            <div
              className={`flex size-11 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
            >
              <Icon className="size-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
