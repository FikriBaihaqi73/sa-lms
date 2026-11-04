import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AcademicYearOption, ClassSubjectOption } from "../types";

interface StudyPlansFilterBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	academicYears: AcademicYearOption[];
	classSubjects: ClassSubjectOption[];
	selectedAcademicYearId: string;
	selectedClassSubjectId: string;
	onAcademicYearChange: (value: string) => void;
	onClassSubjectChange: (value: string) => void;
}

export function StudyPlansFilterBar({
	search,
	onSearchChange,
	academicYears,
	classSubjects,
	selectedAcademicYearId,
	selectedClassSubjectId,
	onAcademicYearChange,
	onClassSubjectChange,
}: StudyPlansFilterBarProps) {
	return (
		<div className="flex flex-col gap-3 md:flex-row">
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				<Input
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Cari nama siswa, NIS/NIM, atau mata pelajaran..."
					className="h-10 border-slate-200 bg-white pl-9 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
				/>
			</div>

			<div className="flex flex-wrap gap-3 sm:flex-nowrap">
				{/* Dropdown Filter Tahun Ajaran */}
				<div className="relative min-w-[180px] flex-1 sm:flex-initial">
					<select
						className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
						value={selectedAcademicYearId}
						onChange={(event) => onAcademicYearChange(event.target.value)}
					>
						<option value="">Semua Tahun Ajaran</option>
						{academicYears.map((ay) => (
							<option key={ay.id} value={ay.id}>
								{ay.academic_year} {ay.is_active ? "(Aktif)" : ""}
							</option>
						))}
					</select>
					<ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				</div>

				{/* Dropdown Filter Kelas / Mapel */}
				<div className="relative min-w-[200px] flex-1 sm:flex-initial">
					<select
						className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
						value={selectedClassSubjectId}
						onChange={(event) => onClassSubjectChange(event.target.value)}
					>
						<option value="">Semua Kelas & Mapel</option>
						{classSubjects.map((cs) => (
							<option key={cs.id} value={cs.id}>
								{cs.subjectName} ({cs.className})
							</option>
						))}
					</select>
					<ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				</div>
			</div>
		</div>
	);
}

