import { KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Permission, Role } from "../types";

interface RoleStatsCardsProps {
  roles: Role[];
  permissions: Permission[];
}

export function RoleStatsCards({ roles, permissions }: RoleStatsCardsProps) {
  const systemCount = roles.filter((role) => role.isSystemRole).length;
  const userCount = roles.reduce((total, role) => total + role.userCount, 0);
  const moduleNames = [...new Set(permissions.map((permission) => permission.module))];
  const cards = [
    {
      label: "Peran Aktif",
      value: roles.length,
      caption: `${systemCount} Sistem • ${roles.length - systemCount} Khusus`,
      icon: ShieldCheck,
    },
    {
      label: "Pengguna yang Ditugaskan",
      value: userCount,
      caption: "Disinkronkan melalui layanan autentikasi",
      icon: UsersRound,
    },
    {
      label: "Matriks Izin",
      value: permissions.length,
      caption: `${moduleNames.length} Domain${moduleNames.length ? ` (${moduleNames.join(", ")})` : ""}`,
      icon: KeyRound,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, caption, icon: Icon }) => (
        <Card key={label} className="rounded-lg shadow-none">
          <CardContent className="flex min-h-[96px] items-center gap-3 border-none p-3.5 shadow-none">
            <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Icon className="size-5" strokeWidth={1.8} /></span>
            <div><p className="font-mono text-2xl font-semibold leading-6 tabular-nums">{value}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{caption}</p></div>
          </CardContent>
        </Card>
      ))}
      <Card className="rounded-lg shadow-none">
        <CardContent className="flex min-h-[96px] items-center gap-3 border-none p-3.5 shadow-none">
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"><ShieldCheck className="size-5" strokeWidth={1.8} /></span>
          <div><p className="font-mono text-lg font-semibold">TERLINDUNGI</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Perlindungan keamanan</p><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Penguncian penugasan pengguna aktif</p></div>
        </CardContent>
      </Card>
    </section>
  );
}
