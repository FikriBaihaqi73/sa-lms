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
      label: "Active Roles",
      value: roles.length,
      caption: `${systemCount} System • ${roles.length - systemCount} Custom`,
      icon: ShieldCheck,
    },
    {
      label: "Assigned Users",
      value: userCount,
      caption: "Synced via auth engine",
      icon: UsersRound,
    },
    {
      label: "Permissions Matrix",
      value: permissions.length,
      caption: `${moduleNames.length} Domains${moduleNames.length ? ` (${moduleNames.join(", ")})` : ""}`,
      icon: KeyRound,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, caption, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="relative border-none p-4 shadow-none">
            <span className="absolute right-4 top-4 rounded bg-blue-50 p-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Icon className="h-3.5 w-3.5" /></span>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}<span className="ml-1 text-[10px] font-normal text-slate-500">{label === "Active Roles" ? "definitions" : label === "Assigned Users" ? "accounts" : "capabilities"}</span></p>
            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{caption}</p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="relative border-none p-4 shadow-none">
          <span className="absolute right-4 top-4 rounded bg-blue-50 p-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><ShieldCheck className="h-3.5 w-3.5" /></span>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Security Guardrail</p>
          <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">PROTECTED</p>
          <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">Active user assignment lock active</p>
        </CardContent>
      </Card>
    </section>
  );
}
