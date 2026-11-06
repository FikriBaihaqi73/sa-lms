import { Calendar, ChevronDown, RotateCcw, Search } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScheduleOption } from "../types";

interface TeachingJournalFilterProps {
	search: string;
	onSearchChange: (value: string) => void;
	scheduleId: string;
	onScheduleChange: (value: string) => void;
	date: string;
	onDateChange: (value: string) => void;
	scheduleOptions: ScheduleOption[];
	onReset: () => void;
}

export const TeachingJournalFilter: React.FC<TeachingJournalFilterProps> = ({
	search,
	onSearchChange,
	scheduleId,
	onScheduleChange,
	date,
	onDateChange,
	scheduleOptions,
	onReset,
}) => {
	const hasActiveFilters = Boolean(search || scheduleId || date);

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
			{/* Search Input dengan Debounce */}
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				<Input
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Cari topik, materi, atau catatan pembelajaran..."
					className="h-10 border-slate-200 bg-white pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
				/>
			</div>

			{/* Filter Dropdown Jadwal / Mapel */}
			<div className="relative w-full sm:w-72">
				<select
					value={scheduleId}
					onChange={(e) => onScheduleChange(e.target.value)}
					className="h-10 w-full appearance-none truncate rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
				>
					<option value="">Semua Jadwal & Kelas</option>
					{scheduleOptions.map((sch) => (
						<option key={sch.id} value={sch.id}>
							{sch.day} • {sch.label}
						</option>
					))}
				</select>
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
			</div>

			{/* Filter Pemilih Tanggal */}
			<div className="relative w-full sm:w-52">
				<Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				<Input
					type="date"
					value={date}
					onChange={(e) => onDateChange(e.target.value)}
					className="h-10 border-slate-200 bg-white pl-9 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
				/>
			</div>

			{/* Tombol Reset Filter jika aktif */}
			{hasActiveFilters && (
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					className="h-10 border-slate-200 px-3 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
					title="Reset Filter"
				>
					<RotateCcw className="mr-1.5 size-3.5" />
					Reset
				</Button>
			)}
		</div>
	);
};
