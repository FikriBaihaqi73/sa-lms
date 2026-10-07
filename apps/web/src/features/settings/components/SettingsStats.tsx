import { Clock, Database, KeyRound, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { Setting } from "../types";

interface SettingsStatsProps {
	settings: Setting[];
	isLoading: boolean;
}

const cardClass =
	"flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900";
const labelClass =
	"font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

function StatCard({
	label,
	icon,
	children,
}: {
	label: string;
	icon: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className={cardClass}>
			<div className="flex items-start justify-between gap-2">
				<p className={labelClass}>{label}</p>
				<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
					{icon}
				</span>
			</div>
			{children}
		</div>
	);
}

export function SettingsStats({ settings, isLoading }: SettingsStatsProps) {
	const total = settings.length;
	const systemKeys = settings.filter(
		(s) =>
			s.settingKey.startsWith("APP_") ||
			s.settingKey.startsWith("AUTH_") ||
			s.settingKey.startsWith("SYS_") ||
			s.settingKey.startsWith("MAIL_"),
	).length;
	const customKeys = total - systemKeys;
	const num = (n: number) => (isLoading ? "..." : n);

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<StatCard label="Total Pengaturan" icon={<Database className="size-5" />}>
				<p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
					{num(total)}{" "}
					<span className="text-sm font-medium text-slate-500">Kunci</span>
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					Semua konfigurasi platform yang tersimpan di basis data.
				</p>
			</StatCard>

			<StatCard
				label="Parameter Sistem Inti"
				icon={<KeyRound className="size-5" />}
			>
				<p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
					{num(systemKeys)}{" "}
					<span className="text-sm font-medium text-slate-500">Parameter</span>
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					Variabel inti (App, Auth, Mail, Session).
				</p>
			</StatCard>

			<StatCard
				label="Parameter Kustom"
				icon={<ShieldCheck className="size-5" />}
			>
				<p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
					{num(customKeys)}{" "}
					<span className="text-sm font-medium text-slate-500">Kustom</span>
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					Variabel tambahan yang dikonfigurasi administrator.
				</p>
			</StatCard>

			<StatCard label="Status Sinkronisasi" icon={<Clock className="size-5" />}>
				<p className="flex items-center gap-2 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
					AKTIF
					<span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
						SYNC
					</span>
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					Konfigurasi disinkronkan secara global untuk seluruh modul.
				</p>
			</StatCard>
		</div>
	);
}
