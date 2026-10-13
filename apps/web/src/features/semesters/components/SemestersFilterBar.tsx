import { Search } from "lucide-react";
import type { AcademicYear } from "@/features/academic-years/types";
import { Select } from "@/components/ui/select";

interface SemestersFilterBarProps {
	search: string;
	academicYearId: string;
	academicYears: AcademicYear[];
	onSearchChange: (value: string) => void;
	onAcademicYearChange: (value: string) => void;
}

export function SemestersFilterBar({
	search,
	academicYearId,
	academicYears,
	onSearchChange,
	onAcademicYearChange,
}: SemestersFilterBarProps) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
					<input
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Cari nama semester atau academic year..."
						aria-label="Cari semester"
						className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
					/>
				</div>
				<Select
					value={academicYearId}
					onChange={(event) => onAcademicYearChange(event.target.value)}
					aria-label="Filter academic year"
					className="h-10 rounded-lg border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
				>
					<option value="">Semua Academic Year</option>
					{academicYears.map((academicYear) => (
						<option key={academicYear.id} value={academicYear.id}>
							{academicYear.academic_year}
						</option>
					))}
				</Select>
			</div>
		</div>
	);
}

