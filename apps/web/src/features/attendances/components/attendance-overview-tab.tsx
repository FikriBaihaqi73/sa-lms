import {
	Download,
	GraduationCap,
	RotateCcw,
	Search,
	Users,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
	useAttendanceSummary,
	useAttendances,
	useClassesOptions,
} from "../hooks";
import type { Attendance } from "../types";
import { AttendanceStats } from "./attendance-stats";

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

interface StudentAttendanceSummary {
	studentId: string;
	studentName: string;
	studentNumber: string;
	className: string;
	totalSessions: number;
	present: number;
	permission: number;
	sick: number;
	absent: number;
	rate: number;
}

export const AttendanceOverviewTab: React.FC = () => {
	const now = new Date();
	const [month, setMonth] = useState<number>(now.getMonth() + 1);
	const [year, setYear] = useState<number>(now.getFullYear());
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [classId, setClassId] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Queries
	const { data: classOptions = [] } = useClassesOptions();

	// Summary query for KPI cards
	const { data: summary, isLoading: loadingSummary } = useAttendanceSummary({
		month,
		year,
		class_id: classId || undefined,
		search: debouncedSearch || undefined,
	});

	// Attendance records query for detailed list & student aggregation
	const { data: attendanceResponse, isLoading: loadingAttendances } =
		useAttendances({
			page: 1,
			limit: 5000,
			month,
			year,
			class_id: classId || undefined,
			search: debouncedSearch || undefined,
		});

	const attendances: Attendance[] = attendanceResponse?.data ?? [];

	// Group and aggregate records per student
	const studentSummaries: StudentAttendanceSummary[] = useMemo(() => {
		const map = new Map<string, StudentAttendanceSummary>();

		for (const att of attendances) {
			const sId = att.student_id;
			const sName = att.student?.profile?.fullName || "Tanpa Nama";
			const sNumber = att.student?.studentNumber || "-";
			const cName =
				att.schedule?.classSubject?.class?.name || "Tidak Ditentukan";

			let record = map.get(sId);
			if (!record) {
				record = {
					studentId: sId,
					studentName: sName,
					studentNumber: sNumber,
					className: cName,
					totalSessions: 0,
					present: 0,
					permission: 0,
					sick: 0,
					absent: 0,
					rate: 0,
				};
				map.set(sId, record);
			}

			record.totalSessions += 1;

			const statusName = (att.attendance_status?.name || "").toLowerCase();
			if (statusName.includes("hadir") || statusName === "present") {
				record.present += 1;
			} else if (statusName.includes("izin") || statusName.includes("permis")) {
				record.permission += 1;
			} else if (statusName.includes("sakit") || statusName.includes("sick")) {
				record.sick += 1;
			} else if (statusName.includes("alpa") || statusName.includes("absen")) {
				record.absent += 1;
			}
		}

		// Calculate rate
		const result: StudentAttendanceSummary[] = [];
		for (const item of map.values()) {
			item.rate =
				item.totalSessions > 0
					? Math.round((item.present / item.totalSessions) * 100)
					: 0;

			// Filter by status if applied
			if (statusFilter) {
				const lowerStatus = statusFilter.toLowerCase();
				if (lowerStatus === "hadir" && item.present === 0) continue;
				if (lowerStatus === "izin" && item.permission === 0) continue;
				if (lowerStatus === "sakit" && item.sick === 0) continue;
				if (lowerStatus === "alpa" && item.absent === 0) continue;
			}

			result.push(item);
		}

		// Sort by rate ascending (students with lowest attendance rate first for admin attention)
		return result.sort(
			(a, b) => a.rate - b.rate || a.studentName.localeCompare(b.studentName),
		);
	}, [attendances, statusFilter]);

	// Breakdown by Class
	const classSummaries = useMemo(() => {
		const map = new Map<
			string,
			{
				className: string;
				totalStudents: Set<string>;
				totalLogs: number;
				present: number;
				permission: number;
				sick: number;
				absent: number;
			}
		>();

		for (const att of attendances) {
			const cName = att.schedule?.classSubject?.class?.name || "Kelas Lainnya";
			let data = map.get(cName);
			if (!data) {
				data = {
					className: cName,
					totalStudents: new Set<string>(),
					totalLogs: 0,
					present: 0,
					permission: 0,
					sick: 0,
					absent: 0,
				};
				map.set(cName, data);
			}

			data.totalStudents.add(att.student_id);
			data.totalLogs += 1;

			const statusName = (att.attendance_status?.name || "").toLowerCase();
			if (statusName.includes("hadir") || statusName === "present") {
				data.present += 1;
			} else if (statusName.includes("izin") || statusName.includes("permis")) {
				data.permission += 1;
			} else if (statusName.includes("sakit") || statusName.includes("sick")) {
				data.sick += 1;
			} else if (statusName.includes("alpa") || statusName.includes("absen")) {
				data.absent += 1;
			}
		}

		return Array.from(map.values()).map((c) => ({
			className: c.className,
			studentCount: c.totalStudents.size,
			totalLogs: c.totalLogs,
			present: c.present,
			rate: c.totalLogs > 0 ? Math.round((c.present / c.totalLogs) * 100) : 0,
		}));
	}, [attendances]);

	// Export to CSV function
	const handleExportCSV = () => {
		if (studentSummaries.length === 0) return;

		const headers = [
			"No",
			"Nama Siswa",
			"NISN",
			"Kelas",
			"Total Pertemuan",
			"Hadir (H)",
			"Izin (I)",
			"Sakit (S)",
			"Alpa (A)",
			"Tingkat Kehadiran (%)",
		];

		const rows = studentSummaries.map((s, idx) => [
			idx + 1,
			`"${s.studentName.replace(/"/g, '""')}"`,
			`"${s.studentNumber}"`,
			`"${s.className.replace(/"/g, '""')}"`,
			s.totalSessions,
			s.present,
			s.permission,
			s.sick,
			s.absent,
			`${s.rate}%`,
		]);

		const csvContent =
			"\uFEFF" +
			[headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`Rekap_Presensi_Overview_${MONTH_NAMES[month - 1]}_${year}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleReset = () => {
		setSearch("");
		setClassId("");
		setStatusFilter("");
		setMonth(now.getMonth() + 1);
		setYear(now.getFullYear());
	};

	return (
		<div className="space-y-6">
			{/* Top Header & Export */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
						Overview & Rekapitulasi Presensi
					</h1>
					<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
						Pantau rangkuman dan statistik kehadiran siswa se-institusi secara
						menyeluruh dan akurat.
					</p>
				</div>
				<button
					type="button"
					onClick={handleExportCSV}
					disabled={studentSummaries.length === 0}
					className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
				>
					<Download className="size-4" />
					<span>Ekspor Rekap (CSV)</span>
				</button>
			</div>

			{/* KPI Summary Cards */}
			<AttendanceStats summary={summary} isLoading={loadingSummary} />

			{/* Global Filter Bar */}
			<div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				{/* Search */}
				<div className="relative min-w-[150px] flex-1 sm:max-w-[220px]">
					<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Cari siswa atau NISN..."
						className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
					/>
				</div>

				{/* Class Filter */}
				<div className="min-w-[130px] sm:max-w-[170px]">
					<select
						value={classId}
						onChange={(e) => setClassId(e.target.value)}
						aria-label="Pilih Kelas"
						className="h-9 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
					>
						<option value="">Semua Kelas</option>
						{classOptions.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>

				{/* Month Filter */}
				<div className="min-w-[130px] sm:max-w-[170px]">
					<select
						value={month}
						onChange={(e) => setMonth(Number(e.target.value))}
						aria-label="Pilih Bulan"
						className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
					>
						{MONTH_NAMES.map((name, idx) => (
							<option key={name} value={idx + 1}>
								{name} {year}
							</option>
						))}
					</select>
				</div>

				{/* Status Filter */}
				<div className="min-w-[120px] sm:max-w-[150px]">
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						aria-label="Filter Status"
						className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
					>
						<option value="">Semua Status</option>
						<option value="hadir">Ada Hadir</option>
						<option value="izin">Ada Izin</option>
						<option value="sakit">Ada Sakit</option>
						<option value="alpa">Ada Alpa</option>
					</select>
				</div>

				{/* Reset Button */}
				<button
					type="button"
					onClick={handleReset}
					title="Reset Filter"
					className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
				>
					<RotateCcw className="size-3.5" />
				</button>
			</div>

			{/* Kelas Overview Cards (Mini Progress by Class) */}
			{classSummaries.length > 0 && !classId && (
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<GraduationCap className="size-4 text-blue-600 dark:text-blue-400" />
							<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
								Performa Kehadiran per Kelas
							</h3>
						</div>
						<span className="text-[11px] text-slate-400">
							{classSummaries.length} Kelas Terdata
						</span>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{classSummaries.map((item) => (
							<div
								key={item.className}
								className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/60 dark:bg-[#0c1322]/50"
							>
								<div className="flex items-start justify-between">
									<div>
										<p className="text-xs font-bold text-slate-900 dark:text-white">
											{item.className}
										</p>
										<p className="text-[11px] text-slate-500">
											{item.studentCount} Siswa • {item.totalLogs} Catatan
										</p>
									</div>
									<span
										className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
											item.rate >= 85
												? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
												: item.rate >= 70
													? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
													: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
										}`}
									>
										{item.rate}%
									</span>
								</div>
								<div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
									<div
										className={`h-full rounded-full transition-all duration-300 ${
											item.rate >= 85
												? "bg-emerald-500"
												: item.rate >= 70
													? "bg-amber-500"
													: "bg-rose-500"
										}`}
										style={{ width: `${item.rate}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Detailed Student Summary Table */}
			<div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				{/* Table Header */}
				<div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-sm font-bold text-slate-900 dark:text-white">
							Rangkuman Kehadiran Seluruh Siswa
						</h2>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Menampilkan agregasi kehadiran siswa berdasarkan filter periode{" "}
							<span className="font-semibold text-slate-700 dark:text-slate-300">
								{MONTH_NAMES[month - 1]} {year}
							</span>
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
							Total: {studentSummaries.length} Siswa
						</span>
					</div>
				</div>

				{/* Table Content */}
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
							<tr>
								<th className="px-4 py-3">No</th>
								<th className="px-4 py-3">Siswa & NISN</th>
								<th className="px-4 py-3">Kelas</th>
								<th className="px-4 py-3 text-center">Total Sesi</th>
								<th className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400">
									Hadir (H)
								</th>
								<th className="px-4 py-3 text-center text-blue-600 dark:text-blue-400">
									Izin (I)
								</th>
								<th className="px-4 py-3 text-center text-amber-600 dark:text-amber-400">
									Sakit (S)
								</th>
								<th className="px-4 py-3 text-center text-rose-600 dark:text-rose-400">
									Alpa (A)
								</th>
								<th className="px-4 py-3 text-center">Tingkat Kehadiran</th>
								<th className="px-4 py-3 text-center">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
							{loadingAttendances ? (
								<tr>
									<td colSpan={10} className="py-12 text-center text-slate-400">
										<div className="flex items-center justify-center gap-2">
											<div className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
											<span>Memuat data rekapitulasi kehadiran...</span>
										</div>
									</td>
								</tr>
							) : studentSummaries.length === 0 ? (
								<tr>
									<td colSpan={10} className="py-12 text-center">
										<Users className="mx-auto size-8 text-slate-300 dark:text-slate-600" />
										<p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
											Tidak ada data kehadiran yang cocok
										</p>
										<p className="text-[11px] text-slate-400">
											Coba ubah periode bulan atau pilih kelas yang berbeda.
										</p>
									</td>
								</tr>
							) : (
								studentSummaries.map((s, idx) => {
									const isLowAttendance = s.rate < 75;
									return (
										<tr
											key={s.studentId}
											className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
										>
											<td className="px-4 py-3 text-slate-400">{idx + 1}</td>
											<td className="px-4 py-3">
												<p className="font-semibold text-slate-900 dark:text-white">
													{s.studentName}
												</p>
												<p className="text-[11px] text-slate-400">
													NISN: {s.studentNumber}
												</p>
											</td>
											<td className="px-4 py-3 text-slate-600 dark:text-slate-300">
												{s.className}
											</td>
											<td className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
												{s.totalSessions}
											</td>
											<td className="px-4 py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
												{s.present}
											</td>
											<td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
												{s.permission}
											</td>
											<td className="px-4 py-3 text-center font-bold text-amber-600 dark:text-amber-400">
												{s.sick}
											</td>
											<td className="px-4 py-3 text-center font-bold text-rose-600 dark:text-rose-400">
												{s.absent}
											</td>
											<td className="px-4 py-3 text-center">
												<div className="flex items-center justify-center gap-2">
													<div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
														<div
															className={`h-full rounded-full ${
																s.rate >= 85
																	? "bg-emerald-500"
																	: s.rate >= 70
																		? "bg-amber-500"
																		: "bg-rose-500"
															}`}
															style={{ width: `${s.rate}%` }}
														/>
													</div>
													<span
														className={`font-bold ${
															s.rate >= 85
																? "text-emerald-600 dark:text-emerald-400"
																: s.rate >= 70
																	? "text-amber-600 dark:text-amber-400"
																	: "text-rose-600 dark:text-rose-400"
														}`}
													>
														{s.rate}%
													</span>
												</div>
											</td>
											<td className="px-4 py-3 text-center">
												{isLowAttendance ? (
													<span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
														Perlu Perhatian
													</span>
												) : (
													<span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
														Baik
													</span>
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
