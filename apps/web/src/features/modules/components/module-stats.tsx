import { BookOpen, CheckCircle, FileText, Lock } from "lucide-react";
import type React from "react";

interface ModuleStatsProps {
	totalModules: number;
	publishedModules: number;
	lockedModules: number;
	totalContents: number;
	isLoading?: boolean;
}

export const ModuleStats: React.FC<ModuleStatsProps> = ({
	totalModules,
	publishedModules,
	lockedModules,
	totalContents,
	isLoading = false,
}) => {
	const format = (value: number) => value.toLocaleString("id-ID");

	const cards = [
		{
			icon: BookOpen,
			label: "TOTAL MODUL",
			value: isLoading ? "..." : format(totalModules),
			subtext: "silabus terdata",
			tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
		},
		{
			icon: CheckCircle,
			label: "DITERBITKAN",
			value: isLoading ? "..." : format(publishedModules),
			subtext: "dapat diakses siswa",
			tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
		},
		{
			icon: Lock,
			label: "TERKUNCI",
			value: isLoading ? "..." : format(lockedModules),
			subtext: "akses dibatasi",
			tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
		},
		{
			icon: FileText,
			label: "KONTEN MATERI",
			value: isLoading ? "..." : format(totalContents),
			subtext: "item materi & tugas",
			tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => (
				<div
					key={card.label}
					className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
				>
					<span className={`rounded-xl p-3 ${card.tone}`}>
						<card.icon className="size-5" />
					</span>
					<div>
						<p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							{card.label}
						</p>
						<p className="text-2xl font-bold text-slate-900 dark:text-white">
							{card.value}
						</p>
						<p className="text-[11px] text-slate-400 dark:text-slate-500">
							{card.subtext}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};

