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
		<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
			{/* 1. SISWA SUDAH KRS */}
			<div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#131c2e] p-4 shadow-sm transition-all hover:border-emerald-500/40">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
						SISWA SUDAH KRS
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/60 text-emerald-400">
						<UserCheck className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-white">
							{stats.studentsWithKrsCount}
						</span>
					)}
					<p className="mt-1 text-[11px] text-slate-400">
						Siswa aktif memiliki rencana studi
					</p>
				</div>
			</div>

			{/* 2. TOTAL PENGAMBILAN */}
			<div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-[#131c2e] p-4 shadow-sm transition-all hover:border-blue-500/40">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
						TOTAL PENGAMBILAN
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/60 text-blue-400">
						<BookOpen className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-white">
							{stats.totalEnrollments}
						</span>
					)}
					<p className="mt-1 text-[11px] text-slate-400">
						Akumulasi {stats.totalCreditsEnrolled} SKS terambil
					</p>
				</div>
			</div>

			{/* 3. KELAS / MAPEL AKTIF */}
			<div className="relative overflow-hidden rounded-xl border border-purple-500/20 bg-[#131c2e] p-4 shadow-sm transition-all hover:border-purple-500/40">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
						KELAS / MAPEL AKTIF
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/60 text-purple-400">
						<Layers className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-white">
							{stats.activeClassSubjectsCount}
						</span>
					)}
					<p className="mt-1 text-[11px] text-slate-400">
						Tersedia di {stats.departmentsCount} bidang/departemen
					</p>
				</div>
			</div>

			{/* 4. SISWA BELUM KRS */}
			<div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-[#131c2e] p-4 shadow-sm transition-all hover:border-amber-500/50">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
						SISWA BELUM KRS
					</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/60 text-amber-400">
						<AlertTriangle className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					{isLoading ? (
						<div className="h-7 w-16 animate-pulse rounded bg-slate-800" />
					) : (
						<span className="text-2xl font-bold tracking-tight text-white">
							{stats.studentsWithoutKrsCount}
						</span>
					)}
					<p className="mt-1 text-[11px] text-amber-400/80">
						Perlu tindak lanjut / force enroll
					</p>
				</div>
			</div>
		</div>
	);
};
