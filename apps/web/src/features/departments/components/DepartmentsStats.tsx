import { Building2, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Department } from "../types";

interface DepartmentsStatsProps {
  departments: Department[];
  totalData: number;
  isLoading: boolean;
}

export function DepartmentsStats({
  departments,
  totalData,
  isLoading,
}: DepartmentsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton preview
          <Card key={index} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4 sm:p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalAssignedStaff = departments.reduce(
    (acc, d) => acc + (d.teachers?.length ?? d._count?.teachers ?? 0),
    0,
  );

  const populatedDepartments = departments.filter(
    (d) => (d.teachers?.length ?? d._count?.teachers ?? 0) > 0,
  ).length;

  const avgStaff =
    departments.length > 0
      ? (totalAssignedStaff / departments.length).toFixed(1)
      : "0";

  const stats = [
    {
      label: "Total Departemen",
      value: `${totalData} Unit`,
      desc: "Struktur organisasi terdaftar",
      icon: Building2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Staf / Guru Ditetapkan",
      value: `${totalAssignedStaff} Orang`,
      desc: "Guru teralokasi ke departemen",
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Departemen Aktif",
      value: `${populatedDepartments} / ${departments.length}`,
      desc: "Unit yang memiliki staf",
      icon: CheckCircle2,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "Rata-rata Staf",
      value: `${avgStaff} Staf/Unit`,
      desc: "Distribusi anggota per unit",
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <span className={`flex size-8 items-center justify-center rounded-lg ${item.bgColor} ${item.color}`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {item.value}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {item.desc}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
