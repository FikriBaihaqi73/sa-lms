import { CheckCircle2, Layers, Ticket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isReferralExpired } from "../lib/referral-utils";
import type { ReferralCode, ReferralCodePageMeta } from "../types";

interface ReferralCodesStatsProps {
  items: ReferralCode[];
  meta?: ReferralCodePageMeta;
  isLoading: boolean;
}

export function ReferralCodesStats({
  items,
  meta,
  isLoading,
}: ReferralCodesStatsProps) {
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

  const totalCodes = meta?.total ?? items.length;
  const activeCount = items.filter(
    (i) => i.is_active && !isReferralExpired(i.expires_at),
  ).length;
  const totalUsed = items.reduce((sum, item) => sum + (item.used_count || 0), 0);
  const limitedQuotaCount = items.filter(
    (i) => i.usage_quota !== null && i.usage_quota !== undefined,
  ).length;

  const stats = [
    {
      label: "Total Kode",
      value: `${totalCodes.toLocaleString("id-ID")} Kode`,
      desc: "Total kode referral terdaftar",
      icon: Ticket,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Kode Aktif",
      value: `${activeCount.toLocaleString("id-ID")} Aktif`,
      desc: "Siap digunakan calon siswa",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Siswa Terdaftar",
      value: `${totalUsed.toLocaleString("id-ID")} Siswa`,
      desc: "Total kuota terkonsumsi",
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/40",
    },
    {
      label: "Dibatasi Kuota",
      value: `${limitedQuotaCount.toLocaleString("id-ID")} Kode`,
      desc: "Memiliki kuota maksimum",
      icon: Layers,
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
