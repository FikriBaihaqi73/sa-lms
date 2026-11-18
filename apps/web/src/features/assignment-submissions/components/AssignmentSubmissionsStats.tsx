import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import type React from "react";

interface AssignmentSubmissionsStatsProps {
	counts: readonly [number, number, number, number] | null;
	isLoading?: boolean;
}

const cardsConfig = [
	{
		title: "TOTAL SISWA",
		Icon: Users,
		color: "text-blue-400 bg-blue-500/15 border-blue-500/40",
	},
	{
		title: "SUDAH MENGUMPULKAN",
		Icon: CheckCircle2,
		color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/40",
	},
	{
		title: "TERLAMBAT",
		Icon: Clock,
		color: "text-amber-400 bg-amber-500/15 border-amber-500/40",
	},
	{
		title: "BELUM MENGUMPULKAN",
		Icon: XCircle,
		color: "text-rose-400 bg-rose-500/15 border-rose-500/40",
	},
];

export const AssignmentSubmissionsStats: React.FC<
	AssignmentSubmissionsStatsProps
> = ({ counts, isLoading = false }) => {
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cardsConfig.map(({ title, Icon, color }, index) => {
				const total = counts ? counts[0] : 0;
				const current = counts ? counts[index] : null;
				const percent =
					total > 0 && current !== null
						? ((current / total) * 100).toFixed(1)
						: "0";

				return (
					<article
						key={title}
						className="flex min-h-32 items-center gap-5 rounded-xl border border-slate-700/70 bg-slate-900/60 p-5 shadow-sm"
					>
						<span className={`rounded-xl border p-4 ${color}`}>
							<Icon className="size-8" aria-hidden="true" />
						</span>
						<div>
							<h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
								{title}
							</h2>
							<p className="mt-1 text-3xl font-bold text-white sm:text-4xl">
								{isLoading ? "…" : current !== null ? current : "—"}
							</p>
							<p className="mt-1 text-xs text-slate-400">
								{isLoading
									? "Memuat data…"
									: !counts
										? "Menunggu data"
										: index === 0
											? "Siswa pada tugas ini"
											: `${percent}% dari total siswa`}
							</p>
						</div>
					</article>
				);
			})}
		</div>
	);
};
