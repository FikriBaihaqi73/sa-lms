import { ChevronDown, RotateCcw, Search } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClassSubjectOption } from "../types";

interface ModuleFilterProps {
	search: string;
	onSearchChange: (value: string) => void;
	classSubjectId: string;
	onClassSubjectChange: (value: string) => void;
	classSubjectOptions: ClassSubjectOption[];
	onReset: () => void;
}

export const ModuleFilter: React.FC<ModuleFilterProps> = ({
	search,
	onSearchChange,
	classSubjectId,
	onClassSubjectChange,
	classSubjectOptions,
	onReset,
}) => {
	const hasActiveFilters = Boolean(search || classSubjectId);

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
			{/* Search Input dengan Debounce */}
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				<Input
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Cari judul modul atau deskripsi pembelajaran..."
					className="h-10 border-slate-200 bg-white pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
				/>
			</div>

			{/* Filter Dropdown Mapel Kelas */}
			<div className="relative w-full sm:w-80">
				<select
					value={classSubjectId}
					onChange={(e) => onClassSubjectChange(e.target.value)}
					className="h-10 w-full appearance-none truncate rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
				>
					<option value="">Semua Mapel Kelas</option>
					{classSubjectOptions.map((opt) => (
						<option key={opt.id} value={opt.id}>
							{opt.label}
						</option>
					))}
				</select>
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
			</div>

			{/* Reset Filters */}
			{hasActiveFilters && (
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					className="h-10 border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
				>
					<RotateCcw className="mr-1.5 size-4" />
					Reset
				</Button>
			)}
		</div>
	);
};

