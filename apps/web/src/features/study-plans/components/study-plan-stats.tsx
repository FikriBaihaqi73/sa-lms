import { AlertTriangle, BookOpen, Layers, UserCheck } from "lucide-react";
import type React from "react";
import type { StudyPlanSummaryStats } from "../types";

interface StudyPlanStatsProps {
	stats: StudyPlanSummaryStats;
	isLoading?: boolean;
}

export const StudyPlanStats: React.FC<StudyPlanStatsProps> = ({
	stats,
	isLoading = false,
}) => {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{/* 1. SISWA SUDAH KRS */}
			<div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						SISWA SUDAH KRS
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
						<UserCheck className="size-3.5" />
					</div>
				</div>
				<div className="mt-2">
					{isLoading ? (
						<div className="h-6 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							{stats.studentsWithKrsCount}
						</span>
					)}
					<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
						Siswa aktif memiliki rencana studi
					</p>
				</div>
			</div>

			{/* 2. TOTAL PENGAMBILAN */}
			<div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						TOTAL PENGAMBILAN
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
						<BookOpen className="size-3.5" />
					</div>
				</div>
				<div className="mt-2">
					{isLoading ? (
						<div className="h-6 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							{stats.totalEnrollments}
						</span>
					)}
					<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
						Akumulasi {stats.totalCreditsEnrolled} SKS terambil
					</p>
				</div>
			</div>

			{/* 3. KELAS / MAPEL AKTIF */}
			<div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						KELAS / MAPEL AKTIF
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
						<Layers className="size-3.5" />
					</div>
				</div>
				<div className="mt-2">
					{isLoading ? (
						<div className="h-6 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							{stats.activeClassSubjectsCount}
						</span>
					)}
					<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
						Tersedia di {stats.departmentsCount} bidang/departemen
					</p>
				</div>
			</div>

			{/* 4. SISWA BELUM KRS */}
			<div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						SISWA BELUM KRS
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
						<AlertTriangle className="size-3.5" />
					</div>
				</div>
				<div className="mt-2">
					{isLoading ? (
						<div className="h-6 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							{stats.studentsWithoutKrsCount}
						</span>
					)}
					<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
						Perlu tindak lanjut / force enroll
					</p>
				</div>
			</div>
		</div>
	);
};
