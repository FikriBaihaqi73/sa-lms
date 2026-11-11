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
	departmentId,
	onDepartmentChange,
	departmentOptions,
	classSubjectId,
	onClassSubjectChange,
	classSubjectOptions,
	onReset,
}) => {
	return (
		<div className="space-y-3">
			{/* 1. View Switcher Tabs */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="inline-flex rounded-xl border border-slate-800 bg-[#0d1526] p-1 shadow-sm">
					<button
						type="button"
						onClick={() => onViewModeChange("student_view")}
						className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
							viewMode === "student_view"
								? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
								: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
						}`}
					>
						<Users className="size-3.5" />
						<span>Rekap per Siswa & SKS</span>
					</button>

					<button
						type="button"
						onClick={() => onViewModeChange("catalog_view")}
						className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
							viewMode === "catalog_view"
								? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
								: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
						}`}
					>
						<LayoutGrid className="size-3.5" />
						<span>Katalog Mapel Kelas</span>
					</button>

					<button
						type="button"
						onClick={() => onViewModeChange("log_view")}
						className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
							viewMode === "log_view"
								? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
								: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
						}`}
					>
						<ListOrdered className="size-3.5" />
						<span>Log Transaksi KRS</span>
					</button>
				</div>

				<span className="text-[11px] text-slate-400">
					Mode:{" "}
					<strong className="text-slate-200">
						{viewMode === "student_view"
							? "Rekapitulasi Siswa & Beban SKS"
							: viewMode === "catalog_view"
								? "Katalog Penawaran Kelas"
								: "Log Individual KRS"}
					</strong>
				</span>
			</div>

			{/* 2. Integrated Filter Bar */}
			<div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-800/90 bg-[#111927] p-2.5 shadow-sm">
				{/* Search Input */}
				<div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
					<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Cari nama siswa, NIS/NIM, kode atau nama mata pelajaran..."
						className="h-9 w-full rounded-lg border border-slate-700/60 bg-[#0c1322] pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 transition-colors focus:border-blue-500 focus:outline-none"
					/>
				</div>

				{/* Academic Year Selector */}
				<div className="min-w-[150px] sm:max-w-[210px]">
					<select
						value={academicYearId}
						onChange={(e) => onAcademicYearChange(e.target.value)}
						aria-label="Pilih Tahun Ajaran"
						className="h-9 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-2.5 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none"
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

				{/* Department / Bidang Selector */}
				<div className="min-w-[140px] sm:max-w-[200px]">
					<select
						value={departmentId}
						onChange={(e) => onDepartmentChange(e.target.value)}
						aria-label="Pilih Bidang / Departemen"
						className="h-9 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-2.5 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none"
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
				<div className="min-w-[180px] flex-1 sm:max-w-[320px]">
					<select
						value={classSubjectId}
						onChange={(e) => onClassSubjectChange(e.target.value)}
						aria-label="Pilih Kelas & Mata Pelajaran"
						className="h-9 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-2.5 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none"
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
					className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-950/30 text-rose-400 transition-colors hover:bg-rose-900/40 hover:text-rose-300"
				>
					<RotateCcw className="size-3.5" />
				</button>
			</div>
		</div>
	);
};
