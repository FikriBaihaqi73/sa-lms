import { BookOpen, BookOpenCheck, Calendar, Users } from "lucide-react";

interface StudyPlansStatsProps {
	totalStudyPlans: number;
	totalUniqueStudents: number;
	totalUniqueClassSubjects: number;
	activeAcademicYearName: string;
	isLoading: boolean;
}

export function StudyPlansStats({
	totalStudyPlans,
	totalUniqueStudents,
	totalUniqueClassSubjects,
	activeAcademicYearName,
	isLoading,
}: StudyPlansStatsProps) {
	const format = (value: number | string) =>
		typeof value === "number" ? value.toLocaleString("id-ID") : value;

	const cards = [
		{
			icon: BookOpen,
			label: "Total Rencana Studi",
			value: isLoading ? "..." : format(totalStudyPlans),
			subtitle: "data KRS tercatat",
			tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
		},
		{
			icon: Users,
			label: "Siswa Terdaftar",
			value: isLoading ? "..." : format(totalUniqueStudents),
			subtitle: "siswa mengambil kelas",
			tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
		},
		{
			icon: BookOpenCheck,
			label: "Mata Pelajaran Kelas",
			value: isLoading ? "..." : format(totalUniqueClassSubjects),
			subtitle: "mapel kelas diambil",
			tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
		},
		{
			icon: Calendar,
			label: "Tahun Ajaran Aktif",
			value: isLoading ? "..." : activeAcademicYearName || "-",
			subtitle: "periode akademik",
			tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
		},
	] as const;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<div
					key={card.label}
					className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<span className={`rounded-xl p-3 ${card.tone}`}>
						<card.icon className="size-5" />
					</span>
					<div className="min-w-0">
						<p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
							{card.label}
						</p>
						<p className="truncate text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
							{card.value}
						</p>
						<p className="text-xs text-slate-400 dark:text-slate-500">
							{card.subtitle}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

