import { Filter, RotateCcw, Search } from "lucide-react";
import type React from "react";
import type { AcademicYearOption, ClassOption } from "../types";

export type ScoreStatusFilterType = "all" | "graded" | "ungraded";

interface ExaminationScoresFilterProps {
	search: string;
	onSearchChange: (value: string) => void;
	academicYearId: string;
	onAcademicYearChange: (value: string) => void;
	academicYears: AcademicYearOption[];
	classId: string;
	onClassChange: (value: string) => void;
	classes: ClassOption[];
	statusFilter: ScoreStatusFilterType;
	onStatusFilterChange: (status: ScoreStatusFilterType) => void;
	onReset: () => void;
}

export const ExaminationScoresFilter: React.FC<
	ExaminationScoresFilterProps
> = ({
	search,
	onSearchChange,
	academicYearId,
	onAcademicYearChange,
	academicYears,
	classId,
	onClassChange,
	classes,
	statusFilter,
	onStatusFilterChange,
	onReset,
}) => {
	return (
		<div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			{/* 1. Fitur Search di Pojok Kiri */}
			<div className="min-w-[220px] flex-1">
				<label
					htmlFor="scores_search_input"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					CARI SISWA
				</label>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<input
						id="scores_search_input"
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Cari nama siswa atau NIS/NIM..."
						className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder-slate-500"
					/>
				</div>
			</div>

			{/* 2. Fitur Tahun Ajaran di Samping Kanan Search */}
			<div className="min-w-[180px] flex-1 sm:max-w-[220px]">
				<label
					htmlFor="scores_academic_year_filter"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					TAHUN AJARAN
				</label>
				<select
					id="scores_academic_year_filter"
					value={academicYearId}
					onChange={(e) => onAcademicYearChange(e.target.value)}
					className="h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					<option value="">Pilih Tahun Ajaran</option>
					{academicYears.map((ay) => (
						<option key={ay.id} value={ay.id}>
							{ay.label}
						</option>
					))}
				</select>
			</div>

			{/* 3. Fitur Kelas di Samping Kanan Tahun Ajaran */}
			<div className="min-w-[200px] flex-1 sm:max-w-[260px]">
				<label
					htmlFor="scores_class_filter"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					PILIH KELAS ({classes.length} KELAS)
				</label>
				<select
					id="scores_class_filter"
					value={classId}
					onChange={(e) => onClassChange(e.target.value)}
					disabled={!academicYearId || classes.length === 0}
					className="h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					<option value="">
						{academicYearId
							? classes.length === 0
								? "Tidak ada kelas di tahun ini"
								: "Pilih Kelas"
							: "Pilih tahun ajaran dahulu"}
					</option>
					{classes.map((cls) => (
						<option key={cls.id} value={cls.id}>
							{cls.name}
						</option>
					))}
				</select>
			</div>

			{/* 4. Fitur Status Nilai di Samping Kanan Kelas */}
			<div className="min-w-[170px] sm:max-w-[200px]">
				<label
					htmlFor="scores_status_filter"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					STATUS NILAI
				</label>
				<div className="relative">
					<Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<select
						id="scores_status_filter"
						value={statusFilter}
						onChange={(e) =>
							onStatusFilterChange(e.target.value as ScoreStatusFilterType)
						}
						className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
					>
						<option value="all">Semua Status</option>
						<option value="graded">Sudah Dinilai</option>
						<option value="ungraded">Belum Dinilai</option>
					</select>
				</div>
			</div>

			{/* 5. Tombol Reset Sejajar Samping Kanan Status Nilai */}
			<div className="flex flex-col justify-end">
				<span
					aria-hidden="true"
					className="mb-1 block select-none text-[10px] font-bold uppercase tracking-wider text-transparent"
				>
					RESET
				</span>
				<button
					type="button"
					onClick={onReset}
					title="Reset filter & pencarian"
					className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
				>
					<RotateCcw className="size-4" />
				</button>
			</div>
		</div>
	);
};
