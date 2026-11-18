import {
	AlertTriangle,
	Award,
	CheckCircle2,
	TrendingUp,
	Users,
} from "lucide-react";
import type React from "react";
import type { GradeMatchResult } from "../types";

interface ExaminationScoresStatsProps {
	gradedCount: number;
	totalStudents: number;
	averageScore: number | null;
	averageGrade: GradeMatchResult;
	maxScore: number | null;
	minScore: number | null;
	unassignedCount: number;
}

export const ExaminationScoresStats: React.FC<ExaminationScoresStatsProps> = ({
	gradedCount,
	totalStudents,
	averageScore,
	averageGrade,
	maxScore,
	minScore,
	unassignedCount,
}) => {
	const completionPercent =
		totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0;

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{/* 1. Peserta Dinilai */}
			<div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
					<Users className="size-5" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
						Peserta Dinilai
					</p>
					<div className="mt-0.5 flex items-baseline gap-2">
						<span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							{gradedCount} / {totalStudents}
						</span>
						<span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
							{completionPercent}%
						</span>
					</div>
					<p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
						{completionPercent === 100
							? "Semua siswa telah dinilai"
							: `${unassignedCount} siswa antre dinilai`}
					</p>
				</div>
			</div>

			{/* 2. Rata-Rata Skor Kelas */}
			<div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
					<TrendingUp className="size-5" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
						Rata-Rata Skor Kelas
					</p>
					<div className="mt-0.5 flex items-center gap-2">
						<span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							{averageScore !== null ? averageScore.toFixed(2) : "-"}
						</span>
						{averageScore !== null && (
							<span
								className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${averageGrade.colorBadge.bg} ${averageGrade.colorBadge.text} ${averageGrade.colorBadge.border}`}
								title={averageGrade.description ?? undefined}
							>
								{averageGrade.grade}
							</span>
						)}
					</div>
					<p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
						{averageScore !== null
							? `Predikat: ${averageGrade.grade} (${averageGrade.scoreRangeText})`
							: "Belum ada nilai terinput"}
					</p>
				</div>
			</div>

			{/* 3. Skor Tertinggi & Terendah */}
			<div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
					<Award className="size-5" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
						Skor Max & Min
					</p>
					<div className="mt-0.5 flex items-baseline gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
						<span className="text-emerald-600 dark:text-emerald-400">
							{maxScore !== null ? maxScore.toFixed(1) : "-"}
						</span>
						<span className="text-slate-300 dark:text-slate-600">/</span>
						<span className="text-rose-600 dark:text-rose-400">
							{minScore !== null ? minScore.toFixed(1) : "-"}
						</span>
					</div>
					<p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
						Rentang nilai capaian tertinggi & terendah
					</p>
				</div>
			</div>

			{/* 4. Belum Dinilai */}
			<div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				<div
					className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
						unassignedCount > 0
							? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
							: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
					}`}
				>
					{unassignedCount > 0 ? (
						<AlertTriangle className="size-5" />
					) : (
						<CheckCircle2 className="size-5 text-emerald-500" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
						Belum Dinilai
					</p>
					<div className="mt-0.5 flex items-baseline gap-2">
						<span
							className={`text-xl font-bold tracking-tight ${
								unassignedCount > 0
									? "text-amber-600 dark:text-amber-400"
									: "text-slate-900 dark:text-white"
							}`}
						>
							{unassignedCount} Siswa
						</span>
					</div>
					<p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
						{unassignedCount > 0
							? "Perlu diisi oleh Penguji / Admin"
							: "Semua skor tuntas dinilai"}
					</p>
				</div>
			</div>
		</div>
	);
};
