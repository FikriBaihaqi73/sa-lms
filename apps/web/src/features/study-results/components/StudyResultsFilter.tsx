import { RotateCcw, Search } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
	AcademicStatusOption,
	AcademicYearOption,
	ClassOption,
	DepartmentOption,
	SemesterOption,
} from "../types";

interface StudyResultsFilterProps {
	search: string;
	departmentId: string;
	classId: string;
	academicYearId: string;
	semesterId: string;
	academicStatusId: string;
	departments: DepartmentOption[];
	classes: ClassOption[];
	academicYears: AcademicYearOption[];
	semesters: SemesterOption[];
	academicStatuses: AcademicStatusOption[];
	onSearchChange: (value: string) => void;
	onDepartmentChange: (value: string) => void;
	onClassChange: (value: string) => void;
	onAcademicYearChange: (value: string) => void;
	onSemesterChange: (value: string) => void;
	onAcademicStatusChange: (value: string) => void;
	onReset: () => void;
}

export const StudyResultsFilter: React.FC<StudyResultsFilterProps> = ({
	search,
	departmentId,
	classId,
	academicYearId,
	semesterId,
	academicStatusId,
	departments,
	classes,
	academicYears,
	semesters,
	academicStatuses,
	onSearchChange,
	onDepartmentChange,
	onClassChange,
	onAcademicYearChange,
	onSemesterChange,
	onAcademicStatusChange,
	onReset,
}) => {
	const hasActiveFilters =
		search.trim() !== "" ||
		departmentId !== "" ||
		classId !== "" ||
		academicYearId !== "" ||
		semesterId !== "" ||
		academicStatusId !== "";

	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
				{/* 1. Search Bar */}
				<div className="relative sm:col-span-2 lg:col-span-2">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
					<Input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Cari siswa (NIS, Nama), tahun ajaran..."
						className="h-9 pl-9 text-xs sm:text-sm"
						aria-label="Cari rekap nilai siswa"
					/>
				</div>

				{/* 2. Filter Departemen */}
				<div>
					<Select
						value={departmentId}
						onChange={(e) => onDepartmentChange(e.target.value)}
						className="h-9 text-xs"
						aria-label="Filter Departemen"
					>
						<option value="">Semua Departemen</option>
						{departments.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.name} ({dept.code})
							</option>
						))}
					</Select>
				</div>

				{/* 3. Filter Kelas */}
				<div>
					<Select
						value={classId}
						onChange={(e) => onClassChange(e.target.value)}
						className="h-9 text-xs"
						aria-label="Filter Kelas"
					>
						<option value="">Semua Kelas</option>
						{classes.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name}
							</option>
						))}
					</Select>
				</div>

				{/* 4. Filter Tahun Ajaran */}
				<div>
					<Select
						value={academicYearId}
						onChange={(e) => onAcademicYearChange(e.target.value)}
						className="h-9 text-xs"
						aria-label="Filter Tahun Ajaran"
					>
						<option value="">Semua Tahun Ajaran</option>
						{academicYears.map((ay) => (
							<option key={ay.id} value={ay.id}>
								{ay.academic_year} {ay.is_active ? "(Aktif)" : ""}
							</option>
						))}
					</Select>
				</div>

				{/* 5. Filter Semester */}
				<div>
					<Select
						value={semesterId}
						onChange={(e) => onSemesterChange(e.target.value)}
						className="h-9 text-xs"
						aria-label="Filter Semester"
					>
						<option value="">Semua Semester</option>
						{semesters.map((sem) => (
							<option key={sem.id} value={sem.id}>
								{sem.name}
							</option>
						))}
					</Select>
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
				<div className="flex items-center gap-2">
					<label
						htmlFor="academic-status-select"
						className="text-xs font-semibold text-slate-500"
					>
						Status Akademik:
					</label>
					<div className="w-44">
						<Select
							id="academic-status-select"
							value={academicStatusId}
							onChange={(e) => onAcademicStatusChange(e.target.value)}
							className="h-8 text-xs"
							aria-label="Filter Status Akademik"
						>
							<option value="">Semua Status</option>
							{academicStatuses.map((st) => (
								<option key={st.id} value={st.id}>
									{st.name}
								</option>
							))}
						</Select>
					</div>
				</div>

				{hasActiveFilters && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onReset}
						className="h-8 gap-1.5 px-3 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
						aria-label="Reset filter"
					>
						<RotateCcw className="size-3.5" />
						<span>Reset Filter</span>
					</Button>
				)}
			</div>
		</div>
	);
};
