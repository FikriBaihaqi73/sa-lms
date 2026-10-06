import { Building2, CheckCircle2, Hourglass, Users } from "lucide-react";

interface InstitutionsStatsProps {
	total: number;
	active: number;
	trial: number;
	totalUsers: number;
	newThisMonth: number;
	fullyOperationalPercentage: number;
	expiringIn3Days: number;
	sla: number;
}

export function InstitutionsStats({
	total,
	active,
	trial,
	totalUsers,
	newThisMonth,
	fullyOperationalPercentage,
	expiringIn3Days,
	sla,
}: InstitutionsStatsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{/* Total Institusi */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							TOTAL INSTITUSI
						</p>
						<p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
							{total}
						</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
						<Building2 className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
					<svg
						aria-hidden="true"
						className="mr-1 size-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
						/>
					</svg>
					<span className="font-medium">+{newThisMonth} Institusi</span>
					<span className="ml-1 text-slate-500 dark:text-slate-400">
						bulan ini
					</span>
				</div>
			</div>

			{/* Aktif */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							AKTIF
						</p>
						<p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
							{active}
						</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
						<CheckCircle2 className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center justify-between text-xs">
					<div className="flex items-center text-slate-500 dark:text-slate-400">
						<span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500"></span>
						{fullyOperationalPercentage}% beroperasi penuh
					</div>
					<span className="font-semibold text-emerald-600 dark:text-emerald-400">
						Optimal
					</span>
				</div>
			</div>

			{/* Masa Trial */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							MASA TRIAL
						</p>
						<p className="mt-2 text-3xl font-bold text-amber-500">{trial}</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
						<Hourglass className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center text-xs text-amber-600 dark:text-amber-400">
					<svg
						aria-hidden="true"
						className="mr-1 size-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
						/>
					</svg>
					<span className="font-medium">
						{expiringIn3Days} berakhir dalam 3 hari
					</span>
				</div>
			</div>

			{/* Total Pengguna */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							TOTAL PENGGUNA
						</p>
						<p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
							{totalUsers.toLocaleString("id-ID")}
						</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
						<Users className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
					<span>Siswa, dosen, dan staf</span>
					<span className="font-semibold text-slate-900 dark:text-slate-50">
						{sla}% SLA
					</span>
				</div>
			</div>
		</div>
	);
}
