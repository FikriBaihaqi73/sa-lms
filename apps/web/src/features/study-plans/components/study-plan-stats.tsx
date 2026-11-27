import { AlertTriangle, BookOpen, Layers, UserCheck } from "lucide-react";
import type React from "react";
import type { StudyPlanSummaryStats } from "../types";

interface StudyPlanStatsProps {
	stats: StudyPlanSummaryStats;
	isLoading?: boolean;
	isError?: boolean;
}

export const StudyPlanStats: React.FC<StudyPlanStatsProps> = ({
	stats,
	isLoading = false,
	isError = false,
}) => {
	return (
		<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
			{/* 1. SISWA SUDAH KRS */}
			<div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 dark:border-emerald-500/20 dark:bg-[#131c2e] dark:hover:border-emerald-500/40">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
						SISWA SUDAH KRS
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400">
						<UserCheck className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							{isError ? "—" : stats.studentsWithKrsCount}
						</span>
					)}
					<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
						Siswa aktif memiliki rencana studi
					</p>
				</div>
			</div>

			{/* 2. TOTAL PENGAMBILAN */}
			<div className="relative overflow-hidden rounded-xl border border-blue-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 dark:border-blue-500/20 dark:bg-[#131c2e] dark:hover:border-blue-500/40">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
						TOTAL PENGAMBILAN
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-950/60 dark:text-blue-400">
						<BookOpen className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							{isError ? "—" : stats.totalEnrollments}
						</span>
					)}
					<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
						Akumulasi {isError ? "—" : stats.totalCreditsEnrolled} SKS terambil
					</p>
				</div>
			</div>

			{/* 3. KELAS / MAPEL AKTIF */}
			<div className="relative overflow-hidden rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition-all hover:border-purple-300 dark:border-purple-500/20 dark:bg-[#131c2e] dark:hover:border-purple-500/40">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">
						KELAS / MAPEL AKTIF
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-950/60 dark:text-purple-400">
						<Layers className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							{isError ? "—" : stats.activeClassSubjectsCount}
						</span>
					)}
					<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
						Tersedia di {isError ? "—" : stats.departmentsCount}{" "}
						bidang/departemen
					</p>
				</div>
			</div>

			{/* 4. SISWA BELUM KRS */}
			<div className="relative overflow-hidden rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition-all hover:border-amber-300 dark:border-amber-500/30 dark:bg-[#131c2e] dark:hover:border-amber-500/50">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
						SISWA BELUM KRS
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-400">
						<AlertTriangle className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							{isError ? "—" : stats.studentsWithoutKrsCount}
						</span>
					)}
					<p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400/80">
						Perlu tindak lanjut / force enroll
					</p>
				</div>
			</div>
		</div>
	);
};
