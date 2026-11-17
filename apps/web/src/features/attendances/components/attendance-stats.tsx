import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Percent,
	Users,
	XCircle,
} from "lucide-react";
import type React from "react";
import type { AttendanceSummary } from "../types";

interface AttendanceStatsProps {
	summary?: AttendanceSummary | null;
	isLoading?: boolean;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
	summary,
	isLoading = false,
}) => {
	const format = (value?: number) => (value ?? 0).toLocaleString("id-ID");

	const cards = [
		{
			icon: Users,
			label: "Total Presensi",
			value: isLoading ? "..." : format(summary?.total),
			iconStyle:
				"bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60",
		},
		{
			icon: CheckCircle2,
			label: "Hadir",
			value: isLoading ? "..." : format(summary?.present),
			iconStyle:
				"bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30",
		},
		{
			icon: Clock,
			label: "Izin",
			value: isLoading ? "..." : format(summary?.permission),
			iconStyle:
				"bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500/30",
		},
		{
			icon: AlertCircle,
			label: "Sakit",
			value: isLoading ? "..." : format(summary?.sick),
			iconStyle:
				"bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/30",
		},
		{
			icon: XCircle,
			label: "Alpa",
			value: isLoading ? "..." : format(summary?.absent),
			iconStyle:
				"bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30",
		},
		{
			icon: Percent,
			label: "Tingkat Kehadiran",
			value: isLoading ? "..." : `${summary?.attendanceRate ?? 0}%`,
			iconStyle:
				"bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-500/30",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
			{cards.map((card) => (
				<div
					key={card.label}
					className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700"
				>
					<div
						className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.iconStyle}`}
					>
						<card.icon className="size-5" />
					</div>
					<div className="min-w-0 flex-1">
						<span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
							{card.label}
						</span>
						<p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							{card.value}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};
