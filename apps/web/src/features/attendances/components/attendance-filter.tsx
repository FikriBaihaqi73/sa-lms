import { RotateCcw, Search } from "lucide-react";
import type React from "react";
import type {
	AcademicYearOption,
	AttendanceStatusOption,
	ClassOption,
	ScheduleOption,
} from "../types";

const MONTH_NAMES = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

interface AttendanceFilterProps {
	search: string;
	onSearchChange: (value: string) => void;
	classId: string;
	onClassChange: (value: string) => void;
	scheduleId: string;
	onScheduleChange: (value: string) => void;
	academicYearId?: string;
	onAcademicYearChange?: (value: string) => void;
	month: number;
	onMonthChange: (value: number) => void;
	year: number;
	onYearChange: (value: number) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
	classOptions: ClassOption[];
	scheduleOptions: ScheduleOption[];
	statusOptions: AttendanceStatusOption[];
	academicYearOptions?: AcademicYearOption[];
	onReset: () => void;
}

export const AttendanceFilter: React.FC<AttendanceFilterProps> = ({
	search,
	onSearchChange,
	classId,
	onClassChange,
	scheduleId,
	onScheduleChange,
	academicYearId = "",
	onAcademicYearChange,
	month,
	onMonthChange,
	onYearChange,
	statusFilter,
	onStatusFilterChange,
	classOptions,
	scheduleOptions,
	statusOptions,
	academicYearOptions = [],
	onReset,
}) => {
	// Generate Month Options dynamically following current system year (e.g. Januari 2026 ... Desember 2026)
	const currentSystemYear = new Date().getFullYear();
	const monthOptions = Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		label: `${MONTH_NAMES[i]} ${currentSystemYear}`,
	}));

	const handleMonthSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedMonth = Number(e.target.value);
		onMonthChange(selectedMonth);
		onYearChange(currentSystemYear);
	};

	return (
		<div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			{/* 1. Search Input */}
			<div className="relative min-w-[150px] flex-1 sm:max-w-[210px]">
				<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				<input
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Cari nama / NISN siswa..."
					className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
				/>
			</div>

			{/* 2. Class Selector (Tanpa Opsi 'Semua') */}
			<div className="min-w-[130px] sm:max-w-[170px]">
				<select
					value={classId}
					onChange={(e) => onClassChange(e.target.value)}
					aria-label="Pilih Kelas"
					className="h-9 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					{classOptions.length === 0 ? (
						<option value="" disabled>
							Pilih Kelas
						</option>
					) : (
						classOptions.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name} {cls.grade_level ? `(Kls ${cls.grade_level})` : ""}
							</option>
						))
					)}
				</select>
			</div>

			{/* 3. Schedule Selector (Lebar Proporsional, Truncate di Trigger, Tanpa Opsi 'Semua') */}
			<div className="min-w-[180px] sm:max-w-[230px] flex-1">
				<select
					value={scheduleId}
					onChange={(e) => onScheduleChange(e.target.value)}
					aria-label="Pilih Jadwal"
					className="h-9 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					{scheduleOptions.length === 0 ? (
						<option value="" disabled>
							Pilih Jadwal Pelajaran
						</option>
					) : (
						scheduleOptions.map((sch) => (
							<option key={sch.id} value={sch.id} title={sch.label}>
								{sch.label}
							</option>
						))
					)}
				</select>
			</div>

			{/* 4. Academic Year Selector (Nama & Status Lengkap, Tanpa Opsi 'Semua') */}
			<div className="min-w-[140px] sm:max-w-[190px]">
				<select
					value={academicYearId}
					onChange={(e) => onAcademicYearChange?.(e.target.value)}
					aria-label="Pilih Tahun Ajaran"
					className="h-9 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					{academicYearOptions.length === 0 ? (
						<option value="" disabled>
							Pilih Tahun Ajaran
						</option>
					) : (
						academicYearOptions.map((ay) => {
							const displayLabel =
								ay.label ||
								`${ay.name || ay.academic_year || "Tahun Ajaran"} (${ay.is_active ? "Aktif" : "Tidak Aktif"})`;
							return (
								<option key={ay.id} value={ay.id}>
									{displayLabel}
								</option>
							);
						})
					)}
				</select>
			</div>

			{/* 5. Period (Bulan Dinamis Mengikuti Tahun Sistem Berjalan) */}
			<div className="min-w-[120px] sm:max-w-[145px]">
				<select
					value={month}
					onChange={handleMonthSelectChange}
					aria-label="Pilih Periode Bulan & Tahun"
					className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					{monthOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>

			{/* 6. Status Selector */}
			<div className="min-w-[100px] sm:max-w-[125px]">
				<select
					value={statusFilter}
					onChange={(e) => onStatusFilterChange(e.target.value)}
					aria-label="Pilih Status"
					className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
				>
					<option value="">Semua Status</option>
					{statusOptions.map((st) => (
						<option key={st.id} value={st.id}>
							{st.name}
						</option>
					))}
				</select>
			</div>

			{/* 7. Reset Button (Icon Only - Reddish Rose) */}
			<button
				type="button"
				onClick={onReset}
				title="Reset Seluruh Filter"
				aria-label="Reset Filter"
				className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
			>
				<RotateCcw className="size-3.5" />
			</button>
		</div>
	);
};
