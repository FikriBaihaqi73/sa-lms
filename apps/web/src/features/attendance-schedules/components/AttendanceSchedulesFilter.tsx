import { RotateCcw, Search } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
	AttendanceScheduleAcademicYear,
	AttendanceScheduleClass,
	AttendanceScheduleType,
} from "../types";

interface AttendanceSchedulesFilterProps {
	academicYears: AttendanceScheduleAcademicYear[];
	classes: AttendanceScheduleClass[];
	academicYearId: string;
	classId: string;
	scheduleType: AttendanceScheduleType | "";
	isActive: "true" | "false" | "";
	search: string;
	onAcademicYearChange: (value: string) => void;
	onClassChange: (value: string) => void;
	onScheduleTypeChange: (value: AttendanceScheduleType | "") => void;
	onIsActiveChange: (value: "true" | "false" | "") => void;
	onSearchChange: (value: string) => void;
	onReset: () => void;
}

export const AttendanceSchedulesFilter: React.FC<
	AttendanceSchedulesFilterProps
> = ({
	academicYears,
	classes,
	academicYearId,
	classId,
	scheduleType,
	isActive,
	search,
	onAcademicYearChange,
	onClassChange,
	onScheduleTypeChange,
	onIsActiveChange,
	onSearchChange,
	onReset,
}) => {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
				{/* Search */}
				<div className="lg:col-span-3">
					<label
						htmlFor="attendance-schedule-search"
						className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
					>
						Cari Jadwal / Mapel
					</label>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
						<Input
							id="attendance-schedule-search"
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder="Judul jadwal atau mata pelajaran..."
							className="pl-9 bg-slate-50 dark:bg-[#0B1220] dark:border-slate-700/80"
						/>
					</div>
				</div>

				{/* Tahun Ajaran */}
				<div className="lg:col-span-2">
					<label
						htmlFor="filter-academic-year"
						className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
					>
						Tahun Ajaran
					</label>
					<Select
						id="filter-academic-year"
						value={academicYearId}
						onChange={(e) => onAcademicYearChange(e.target.value)}
						className="bg-slate-50 dark:bg-[#0B1220] dark:border-slate-700/80 dark:text-slate-100"
					>
						<option value="">Semua Tahun Ajaran</option>
						{academicYears.map((ay) => (
							<option key={ay.id} value={ay.id}>
								{ay.academic_year} {ay.is_active ? "(Aktif)" : ""}
							</option>
						))}
					</Select>
				</div>

				{/* Kelas */}
				<div className="lg:col-span-2">
					<label
						htmlFor="filter-class"
						className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
					>
						Kelas
					</label>
					<Select
						id="filter-class"
						value={classId}
						onChange={(e) => onClassChange(e.target.value)}
						className="bg-slate-50 dark:bg-[#0B1220] dark:border-slate-700/80 dark:text-slate-100"
					>
						<option value="">Semua Kelas</option>
						{classes.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name}
							</option>
						))}
					</Select>
				</div>

				{/* Tipe Jadwal */}
				<div className="lg:col-span-2">
					<label
						htmlFor="filter-schedule-type"
						className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
					>
						Tipe Jadwal
					</label>
					<Select
						id="filter-schedule-type"
						value={scheduleType}
						onChange={(e) =>
							onScheduleTypeChange(
								e.target.value as AttendanceScheduleType | "",
							)
						}
						className="bg-slate-50 dark:bg-[#0B1220] dark:border-slate-700/80 dark:text-slate-100"
					>
						<option value="">Semua Tipe</option>
						<option value="FROM_SCHEDULE">Dari Jadwal Pelajaran</option>
						<option value="STANDALONE">Sesi Mandiri</option>
					</Select>
				</div>

				{/* Status */}
				<div className="lg:col-span-2">
					<label
						htmlFor="filter-status"
						className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
					>
						Status
					</label>
					<Select
						id="filter-status"
						value={isActive}
						onChange={(e) =>
							onIsActiveChange(e.target.value as "true" | "false" | "")
						}
						className="bg-slate-50 dark:bg-[#0B1220] dark:border-slate-700/80 dark:text-slate-100"
					>
						<option value="">Semua Status</option>
						<option value="true">Aktif</option>
						<option value="false">Nonaktif</option>
					</Select>
				</div>

				{/* Reset */}
				<div className="lg:col-span-1 flex justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onReset}
						title="Reset filter"
						className="w-full dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
					>
						<RotateCcw className="size-4" />
						<span className="lg:sr-only ml-1.5">Reset</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
