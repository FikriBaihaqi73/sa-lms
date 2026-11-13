import { BookOpen, CheckCircle2, FileText, Lock } from "lucide-react";
import React from "react";
import type { ModuleStats } from "../types";

interface ModuleStatsCardsProps {
  stats: ModuleStats;
  isLoading?: boolean;
}

export const ModuleStatsCards: React.FC<ModuleStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const cards = [
    {
      title: "Total Modul",
      value: stats.totalModules,
      icon: BookOpen,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-100 dark:border-blue-900/50",
    },
    {
      title: "Modul Diterbitkan",
      value: stats.publishedModules,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
    },
    {
      title: "Modul Terkunci",
      value: stats.lockedModules,
      icon: Lock,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-100 dark:border-amber-900/50",
    },
    {
      title: "Total Konten Materi",
      value: stats.totalContents,
      icon: FileText,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-100 dark:border-purple-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`flex items-center justify-between rounded-2xl border ${card.borderColor} bg-white p-4 shadow-sm transition hover:shadow dark:bg-slate-900`}
          >
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {isLoading ? "..." : card.value}
              </p>
            </div>
            <div
              className={`flex size-11 items-center justify-center rounded-xl ${card.bgColor} ${card.iconColor}`}
            >
              <Icon className="size-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

