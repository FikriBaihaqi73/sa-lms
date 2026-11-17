import { AlertTriangle, Award, FileText, Users } from "lucide-react";
import type React from "react";
import type { AssignmentStatsSummary } from "../types";

interface AssignmentStatsProps {
	stats: AssignmentStatsSummary;
	className?: string;
	isLoading?: boolean;
}

export const AssignmentStats: React.FC<AssignmentStatsProps> = ({
	stats,
	className = "Kelas",
	isLoading = false,
}) => {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111927]/60 p-4"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
			{/* Card 1: Tugas Terbit di Kelas */}
			<div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
						TUGAS TERBIT DI KELAS
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-950/50 dark:text-blue-400">
						<FileText className="size-4" />
					</div>
				</div>
				<div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
					{stats.totalAssignments}
				</div>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Terdistribusi pada {stats.totalModulesCount} modul di{" "}
					<strong className="font-semibold text-slate-700 dark:text-slate-200">
						{className}
					</strong>
				</p>
			</div>

			{/* Card 2: Siswa Mengumpulkan */}
			<div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
						SISWA MENGUMPULKAN
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-400">
						<Users className="size-4" />
					</div>
				</div>
				<div className="mt-2 flex items-baseline gap-2">
					<span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
						{stats.submittedCount} / {stats.totalStudentsCount}
					</span>
					<span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400">
						{stats.submissionPercentage}%
					</span>
				</div>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Progres submisi pada tugas yang sedang dipilih
				</p>
			</div>

			{/* Card 3: Sudah Dinilai Guru */}
			<div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
						SUDAH DINILAI GURU
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-950/50 dark:text-purple-400">
						<Award className="size-4" />
					</div>
				</div>
				<div className="mt-2 flex items-baseline gap-2">
					<span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
						{stats.gradedCount} / {stats.submittedCount}
					</span>
					<span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300">
						{stats.pendingGradingCount} antre nilai
					</span>
				</div>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Penilaian diinput langsung oleh Guru Pengampu
				</p>
			</div>

			{/* Card 4: Belum Mengumpulkan */}
			<div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700/80">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
						BELUM MENGUMPULKAN
					</span>
					<div className="flex size-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-400">
						<AlertTriangle className="size-4" />
					</div>
				</div>
				<div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
					{stats.unsubmittedCount}
				</div>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Siswa di kelas ini belum mengirim berkas tugas
				</p>
			</div>
		</div>
	);
};
