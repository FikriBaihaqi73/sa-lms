import {
	CalendarCheck2,
	CheckCircle2,
	Layers,
	PauseCircle,
} from "lucide-react";
import type React from "react";
import type { AttendanceScheduleStats } from "../types";

interface AttendanceSchedulesStatsProps {
	stats?: AttendanceScheduleStats | null;
	isLoading?: boolean;
}

export const AttendanceSchedulesStats: React.FC<
	AttendanceSchedulesStatsProps
> = ({ stats, isLoading = false }) => {
	const format = (val?: number) => (val ?? 0).toLocaleString("id-ID");

	const cards = [
		{
			icon: CalendarCheck2,
			label: "Total Jadwal Absensi",
			value: isLoading ? "..." : format(stats?.total),
			iconStyle:
				"bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500/30",
		},
		{
			icon: CheckCircle2,
			label: "Jadwal Aktif",
			value: isLoading ? "..." : format(stats?.active),
			iconStyle:
				"bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30",
		},
		{
			icon: PauseCircle,
			label: "Jadwal Nonaktif / Libur",
			value: isLoading ? "..." : format(stats?.inactive),
			iconStyle:
				"bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30",
		},
		{
			icon: Layers,
			label: "Sesi Mandiri",
			value: isLoading ? "..." : format(stats?.standalone),
			iconStyle:
				"bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-500/30",
		},
	];

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<div
					key={card.label}
					className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700"
				>
					<div
						className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.iconStyle}`}
					>
						<card.icon className="size-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
							{card.label}
						</p>
						<p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
							{card.value}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};
