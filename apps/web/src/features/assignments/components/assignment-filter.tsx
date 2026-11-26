import { RotateCcw, Search } from "lucide-react";
import type React from "react";
import type {
	AcademicYearOption,
	ClassOption,
	LearningModuleOption,
} from "../types";

interface AssignmentFilterProps {
	search: string;
	onSearchChange: (value: string) => void;
	academicYearId: string;
	onAcademicYearChange: (value: string) => void;
	academicYears: AcademicYearOption[];
	classId: string;
	onClassChange: (value: string) => void;
	classes: ClassOption[];
	moduleId: string;
	onModuleChange: (value: string) => void;
	modules: LearningModuleOption[];
	onReset: () => void;
}

export const AssignmentFilter: React.FC<AssignmentFilterProps> = ({
	search,
	onSearchChange,
	academicYearId,
	onAcademicYearChange,
	academicYears,
	classId,
	onClassChange,
	classes,
	moduleId,
	onModuleChange,
	modules,
	onReset,
}) => {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			{/* 1. Search Bar (Pojok Kiri) */}
			<div className="min-w-[390px] flex-1 sm:max-w-[280px]">
				<label
					htmlFor="assignment_search"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					PENCARIAN PENUGASAN
				</label>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<input
						id="assignment_search"
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Cari judul tugas, modul, atau guru pengampu..."
						className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
					/>
				</div>
			</div>

			{/* 2. Tahun Ajaran / Angkatan */}
			<div className="min-w-[180px] flex-1 sm:max-w-[220px]">
				<label
					htmlFor="academic_year_filter"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					1. TAHUN AJARAN / ANGKATAN
				</label>
				<select
					id="academic_year_filter"
					value={academicYearId}
					onChange={(e) => onAcademicYearChange(e.target.value)}
					className="h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					<option value="">Semua Tahun Ajaran</option>
					{academicYears.map((ay) => (
						<option key={ay.id} value={ay.id}>
							{ay.label}
						</option>
					))}
				</select>
			</div>

			{/* 3. Pilih Kelas */}
			<div className="min-w-[200px] flex-1 sm:max-w-[260px]">
				<label
					htmlFor="class_filter"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					2. PILIH KELAS ({classes.length} KELAS)
				</label>
				<select
					id="class_filter"
					value={classId}
					onChange={(e) => onClassChange(e.target.value)}
					className="h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					<option value="">Semua Kelas</option>
					{classes.map((cls) => (
						<option key={cls.id} value={cls.id}>
							{cls.name}
							{cls.departmentName ? ` — Bidang: ${cls.departmentName}` : ""}
						</option>
					))}
				</select>
			</div>

			{/* 4. Filter Modul / Mapel */}
			<div className="min-w-[200px] flex-1 sm:max-w-[260px]">
				<label
					htmlFor="module_filter"
					className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
				>
					3. FILTER MODUL / MAPEL ({modules.length} MODUL)
				</label>
				<select
					id="module_filter"
					value={moduleId}
					onChange={(e) => onModuleChange(e.target.value)}
					className="h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					<option value="">Semua Modul di Kelas Terpilih</option>
					{modules.map((m) => (
						<option key={m.id} value={m.id}>
							{m.title}
						</option>
					))}
				</select>
			</div>

			{/* 5. Reset Filter Button */}
			<div className="self-end pb-0.5">
				<button
					type="button"
					onClick={onReset}
					title="Reset Seluruh Filter"
					aria-label="Reset Filter"
					className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
				>
					<RotateCcw className="size-3.5" />
				</button>
			</div>
		</div>
	);
};
