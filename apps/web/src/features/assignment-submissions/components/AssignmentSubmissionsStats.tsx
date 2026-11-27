import { Award, CheckCircle2, Clock, FileCheck2 } from "lucide-react";
import type React from "react";

interface AssignmentSubmissionsStatsProps {
	counts: readonly [number, number, number, number] | null;
	isLoading?: boolean;
}

const cardsConfig = [
	{
		title: "TOTAL HASIL MASUK",
		subtitle: "Tugas dikirim ke sistem",
		Icon: FileCheck2,
		color:
			"border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-950/50 dark:text-blue-400",
	},
	{
		title: "SUDAH DINILAI",
		subtitle: "Telah diberi nilai guru",
		Icon: CheckCircle2,
		color:
			"border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-400",
	},
	{
		title: "MENUNGGU PENILAIAN",
		subtitle: "Perlu ditinjau guru",
		Icon: Clock,
		color:
			"border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-400",
	},
	{
		title: "RATA-RATA NILAI",
		subtitle: "Dari hasil yang dinilai",
		Icon: Award,
		color:
			"border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-950/50 dark:text-purple-400",
	},
];

export const AssignmentSubmissionsStats: React.FC<
	AssignmentSubmissionsStatsProps
> = ({ counts, isLoading = false }) => {
	return (
		<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
			{cardsConfig.map(({ title, subtitle, Icon, color }, index) => {
				const current = counts ? counts[index] : null;

				return (
					<article
						key={title}
						className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700/80"
					>
						<div className="flex items-center justify-between">
							<h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
								{title}
							</h2>
							<span
								className={`flex size-7 items-center justify-center rounded-lg border ${color}`}
							>
								<Icon className="size-4" aria-hidden="true" />
							</span>
						</div>
						<p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							{isLoading ? "…" : current !== null ? current : "—"}
						</p>
						<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
							{isLoading ? "Memuat data…" : subtitle}
						</p>
					</article>
				);
			})}
		</div>
	);
};
