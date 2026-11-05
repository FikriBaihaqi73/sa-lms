import { BookOpen, CheckCircle2, Clock, Users } from "lucide-react";
import type React from "react";

interface TeachingJournalStatsProps {
	totalJournals: number;
	totalMeetings: number;
	uniqueTeachers: number;
	uniqueSchedules: number;
	isLoading?: boolean;
}

export const TeachingJournalStats: React.FC<TeachingJournalStatsProps> = ({
	totalJournals,
	totalMeetings,
	uniqueTeachers,
	uniqueSchedules,
	isLoading = false,
}) => {
	const format = (value: number) => value.toLocaleString("id-ID");

	const cards = [
		{
			icon: BookOpen,
			label: "TOTAL JURNAL",
			value: isLoading ? "..." : format(totalJournals),
			subtext: "sesi terdata",
			tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
		},
		{
			icon: CheckCircle2,
			label: "TOTAL PERTEMUAN",
			value: isLoading ? "..." : format(totalMeetings),
			subtext: "pertemuan terlaksana",
			tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
		},
		{
			icon: Users,
			label: "GURU MENGISI",
			value: isLoading ? "..." : format(uniqueTeachers),
			subtext: "pengajar aktif",
			tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
		},
		{
			icon: Clock,
			label: "JADWAL TERPANTAU",
			value: isLoading ? "..." : format(uniqueSchedules),
			subtext: "kelas termonitor",
			tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
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
						<p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">
							{card.label}
						</p>
						<p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
							{card.value}
						</p>
						<p className="text-xs text-slate-400 dark:text-slate-500">
							{card.subtext}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};
