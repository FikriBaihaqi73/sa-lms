import {
	LayoutGrid,
	ListOrdered,
	RotateCcw,
	Search,
	Users,
} from "lucide-react";
import type React from "react";
import type {
	AcademicYearOption,
	ClassSubjectOption,
	DepartmentOption,
	SemesterOption,
	StudyPlanViewMode,
} from "../types";

interface StudyPlanFilterProps {
	viewMode: StudyPlanViewMode;
	onViewModeChange: (mode: StudyPlanViewMode) => void;
	search: string;
	onSearchChange: (val: string) => void;
	academicYearId: string;
	onAcademicYearChange: (val: string) => void;
	academicYearOptions: AcademicYearOption[];
	semesterId?: string;
	onSemesterChange?: (val: string) => void;
	semesterOptions?: SemesterOption[];
	departmentId: string;
	onDepartmentChange: (val: string) => void;
	departmentOptions: DepartmentOption[];
	classSubjectId: string;
	onClassSubjectChange: (val: string) => void;
	classSubjectOptions: ClassSubjectOption[];
	onReset: () => void;
}

export const StudyPlanFilter: React.FC<StudyPlanFilterProps> = ({
	viewMode,
	onViewModeChange,
	search,
	onSearchChange,
	academicYearId,
	onAcademicYearChange,
	academicYearOptions,
	semesterId = "",
	onSemesterChange,
	semesterOptions = [],
	departmentId,
	onDepartmentChange,
	departmentOptions,
	classSubjectId,
	onClassSubjectChange,
	classSubjectOptions,
	onReset,
}) => {
	return (
		<div className="space-y-2.5">
			{/* 1. View Switcher Tabs */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="inline-flex rounded-lg border border-slate-200/80 bg-slate-100/90 p-0.5 dark:border-slate-800/80 dark:bg-[#0c1322]">
					<button
						type="button"
						onClick={() => onViewModeChange("student_view")}
						className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all ${
							viewMode === "student_view"
								? "bg-white font-semibold text-blue-600 shadow-xs dark:bg-[#111927] dark:text-blue-400"
								: "font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
						}`}
					>
						<Users className="size-3.5" />
						<span>Rekap per Siswa & SKS</span>
					</button>

					<button
						type="button"
						onClick={() => onViewModeChange("catalog_view")}
						className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all ${
							viewMode === "catalog_view"
								? "bg-white font-semibold text-blue-600 shadow-xs dark:bg-[#111927] dark:text-blue-400"
								: "font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
						}`}
					>
						<LayoutGrid className="size-3.5" />
						<span>Katalog Mapel Kelas</span>
					</button>

					<button
						type="button"
						onClick={() => onViewModeChange("log_view")}
						className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all ${
							viewMode === "log_view"
								? "bg-white font-semibold text-blue-600 shadow-xs dark:bg-[#111927] dark:text-blue-400"
								: "font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
						}`}
					>
						<ListOrdered className="size-3.5" />
						<span>Log Transaksi KRS</span>
					</button>
				</div>
			</div>

			{/* 2. Integrated Filter Bar */}
			<div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-xs dark:border-slate-800/80 dark:bg-[#111927]">
				{/* Search Input */}
				<div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
					<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Cari siswa, NIS, atau mapel..."
						className="h-8.5 w-full rounded-lg border border-slate-200/80 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
					/>
				</div>

				{/* Academic Year Selector */}
				<div className="min-w-[140px] sm:max-w-[200px]">
					<select
						value={academicYearId}
						onChange={(e) => onAcademicYearChange(e.target.value)}
						aria-label="Pilih Tahun Ajaran"
						className="h-8.5 w-full truncate rounded-lg border border-slate-200/80 bg-slate-50/70 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-200"
					>
						{academicYearOptions.length === 0 ? (
							<option value="" disabled>
								Pilih Tahun Ajaran
							</option>
						) : (
							academicYearOptions.map((ay) => (
								<option key={ay.id} value={ay.id}>
									{ay.label}
								</option>
							))
						)}
					</select>
				</div>

				{/* Semester Selector */}
				{semesterOptions.length > 0 && (
					<div className="min-w-[130px] sm:max-w-[190px]">
						<select
							value={semesterId}
							onChange={(e) => onSemesterChange?.(e.target.value)}
							aria-label="Pilih Semester"
							className="h-8.5 w-full truncate rounded-lg border border-slate-200/80 bg-slate-50/70 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-200"
						>
							<option value="">Semua Semester</option>
							{semesterOptions.map((sem) => (
								<option key={sem.id} value={sem.id}>
									{sem.name} {sem.is_active ? "(Aktif)" : ""}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Department / Bidang Selector */}
				<div className="min-w-[130px] sm:max-w-[190px]">
					<select
						value={departmentId}
						onChange={(e) => onDepartmentChange(e.target.value)}
						aria-label="Pilih Bidang / Departemen"
						className="h-8.5 w-full truncate rounded-lg border border-slate-200/80 bg-slate-50/70 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-200"
					>
						<option value="">Semua Bidang / Departemen</option>
						{departmentOptions.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.id === "umum" || !dept.code
									? dept.name
									: `${dept.name} (${dept.code})`}
							</option>
						))}
					</select>
				</div>

				{/* Class Subject Selector */}
				<div className="min-w-[160px] flex-1 sm:max-w-[280px]">
					<select
						value={classSubjectId}
						onChange={(e) => onClassSubjectChange(e.target.value)}
						aria-label="Pilih Kelas & Mata Pelajaran"
						className="h-8.5 w-full truncate rounded-lg border border-slate-200/80 bg-slate-50/70 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-200"
					>
						<option value="">Semua Mata Pelajaran Kelas</option>
						{classSubjectOptions.map((cs) => (
							<option key={cs.id} value={cs.id} title={cs.label}>
								{cs.label}
							</option>
						))}
					</select>
				</div>

				{/* Reset Filter Button */}
				<button
					type="button"
					onClick={onReset}
					title="Reset Seluruh Filter"
					aria-label="Reset Filter"
					className="flex size-8.5 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
				>
					<RotateCcw className="size-3.5" />
				</button>
			</div>
		</div>
	);
};
