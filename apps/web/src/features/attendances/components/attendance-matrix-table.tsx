import {
	AlertCircle,
	Check,
	ChevronDown,
	FileText,
	RefreshCw,
	X,
} from "lucide-react";
import type React from "react";
import type {
	AttendanceMatrixStudentRow,
	AttendanceMonthDay,
	AttendanceStatusOption,
} from "../types";

interface AttendanceMatrixTableProps {
	monthDays: AttendanceMonthDay[];
	rows: AttendanceMatrixStudentRow[];
	statusOptions: AttendanceStatusOption[];
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	onCellClick: (
		studentId: string,
		studentName: string,
		studentNumber: string,
		dateStr: string,
		currentStatusId?: string | null,
		currentNotes?: string | null,
	) => void;
	onQuickStatusChange?: (
		studentId: string,
		dateStr: string,
		statusId: string,
	) => void;
	onBulkMarkPresent?: (dateStr: string) => void;
	scheduleTitle?: string;
	teacherName?: string;
}

export const AttendanceMatrixTable: React.FC<AttendanceMatrixTableProps> = ({
	monthDays,
	rows,
	isLoading = false,
	isError = false,
	onRetry,
	onCellClick,
	scheduleTitle,
	teacherName,
}) => {
	// Daily totals for the footer
	const dailyStats = monthDays.map((day) => {
		let present = 0;
		let total = 0;
		for (const row of rows) {
			const cell = row.cells[day.dateStr];
			if (cell?.statusName) {
				total++;
				const lower = cell.statusName.toLowerCase();
				if (lower.includes("hadir") || lower === "present") {
					present++;
				}
			}
		}
		const rate = total > 0 ? Math.round((present / total) * 100) : null;
		return { present, total, rate };
	});

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-red-900/30 bg-red-950/20 p-12 text-center">
				<AlertCircle className="size-10 text-red-400" />
				<h3 className="mt-3 text-sm font-semibold text-white">
					Gagal memuat matriks presensi
				</h3>
				<p className="mt-1 text-xs text-slate-400">
					Terjadi kendala saat mengambil data presensi siswa.
				</p>
				{onRetry && (
					<button
						type="button"
						onClick={onRetry}
						className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
					>
						<RefreshCw className="size-3.5" />
						Coba Lagi
					</button>
				)}
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#111927] p-16 shadow-sm">
				<RefreshCw className="size-8 animate-spin text-blue-500" />
				<p className="mt-3 text-sm font-medium text-slate-400">
					Memuat matriks presensi bulanan...
				</p>
			</div>
		);
	}

	if (rows.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-[#111927] p-16 text-center shadow-sm">
				<FileText className="size-12 text-slate-600" />
				<h3 className="mt-4 text-base font-semibold text-white">
					Belum ada data siswa atau presensi
				</h3>
				<p className="mt-1 max-w-sm text-xs text-slate-400">
					Pilih kelas atau jadwal pada filter di atas untuk menampilkan daftar
					siswa dan mencatat kehadiran.
				</p>
			</div>
		);
	}

	return (
		<div className="relative overflow-hidden rounded-xl border border-slate-800/90 bg-[#111927] shadow-sm">
			{/* Matrix Card Header */}
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3">
				{/* Left: Title + Schedule Badge + Pengampu */}
				<div className="flex flex-wrap items-center gap-2.5">
					<h3 className="text-sm font-semibold tracking-tight text-white">
						Matrix Kehadiran Siswa
					</h3>
					{scheduleTitle && (
						<span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-950/60 px-2.5 py-0.5 text-xs font-medium text-blue-400">
							{scheduleTitle}
						</span>
					)}
					{teacherName && (
						<span className="text-xs text-slate-400">
							Pengampu: {teacherName}
						</span>
					)}
				</div>

				{/* Right: Legend & Student Count (Sesuai Referensi Gambar) */}
				<div className="flex flex-wrap items-center gap-3 text-xs">
					<div className="flex items-center gap-3 text-[11px] font-medium text-slate-300">
						<span className="flex items-center gap-1 text-emerald-400">
							<Check className="size-3" /> Hadir
						</span>
						<span className="flex items-center gap-1 text-blue-400">
							<span className="font-bold">I</span> Izin
						</span>
						<span className="flex items-center gap-1 text-amber-400">
							<span className="size-1.5 rounded-full bg-amber-400" /> Sakit
						</span>
						<span className="flex items-center gap-1 text-rose-400">
							<X className="size-3" /> Alpa
						</span>
					</div>
					<span className="ml-1 font-medium text-slate-400">
						Menampilkan {rows.length} siswa
					</span>
				</div>
			</div>

			{/* Matrix Table Scroll Container */}
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-xs">
					<thead>
						<tr className="border-b border-slate-800 bg-[#0d1526]">
							{/* Sticky Left Column: Student & Class */}
							<th className="sticky left-0 z-20 min-w-[220px] max-w-[260px] border-r border-slate-800 bg-[#0d1526] px-4 py-3 text-left font-bold uppercase tracking-wider text-slate-400">
								PENGGUNA (SISWA & KELAS)
							</th>

							{/* Horizontal Date Headers */}
							{monthDays.map((day) => {
								const dateParts = day.dateStr.split("-");
								const yearNum = dateParts[0];
								const dayUpper = day.dayName.toUpperCase();
								// Aturan: Hanya Minggu (0) yang Libur, Senin-Sabtu (1..6) Aktif
								const isSunday = day.dayOfWeek === 0;

								return (
									<th
										key={day.dateStr}
										className={`min-w-[70px] border-r border-slate-800/80 px-2 py-2.5 text-center transition-colors ${
											!isSunday ? "bg-blue-950/20" : "bg-[#0d1526]/50"
										}`}
									>
										<div className="flex flex-col items-center gap-0.5">
											{/* Status Chip: • Aktif (Senin-Sabtu) or • Libur (Minggu) */}
											{!isSunday ? (
												<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/70 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
													<span className="size-1 rounded-full bg-emerald-400" />
													Aktif
												</span>
											) : (
												<span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 text-[9px] font-medium text-slate-500">
													<span className="size-1 rounded-full bg-slate-600" />
													Libur
												</span>
											)}

											{/* Day & Date e.g. MON, 02 NOV */}
											<span className="mt-1 text-[11px] font-bold uppercase tracking-tight text-white">
												{dayUpper}, {day.dayNumberFormatted}
											</span>
											{/* Year */}
											<span className="text-[10px] text-slate-500">
												{yearNum}
											</span>
										</div>
									</th>
								);
							})}
						</tr>
					</thead>

					<tbody className="divide-y divide-slate-800/60">
						{rows.map((row) => (
							<tr
								key={row.studentId}
								className="transition-colors hover:bg-slate-800/20"
							>
								{/* Sticky Left: Student Name & Class / NISN */}
								<td className="sticky left-0 z-10 border-r border-slate-800 bg-[#0d1526] px-4 py-2.5">
									<p className="truncate text-xs font-bold uppercase tracking-wide text-white">
										{row.fullName}
									</p>
									<p className="truncate text-[11px] text-slate-400">
										{row.className || "Kelas"} • {row.studentNumber || "-"}
									</p>
								</td>

								{/* Horizontal Day Cells */}
								{monthDays.map((day) => {
									const cell = row.cells[day.dateStr];
									const statusName = cell?.statusName?.toLowerCase() ?? "";
									const isSunday = day.dayOfWeek === 0;

									let pillTone =
										"bg-slate-900/80 border-slate-800 text-slate-500 hover:bg-slate-800/80";
									let pillIconNode = <span className="font-bold">-</span>;

									if (
										statusName.includes("hadir") ||
										statusName === "present"
									) {
										pillTone =
											"bg-emerald-950/60 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50";
										pillIconNode = <Check className="size-3" />;
									} else if (
										statusName.includes("izin") ||
										statusName.includes("permit")
									) {
										pillTone =
											"bg-blue-950/60 border-blue-500/30 text-blue-400 hover:bg-blue-900/50";
										pillIconNode = <span className="font-bold">I</span>;
									} else if (
										statusName.includes("sakit") ||
										statusName.includes("sick")
									) {
										pillTone =
											"bg-amber-950/60 border-amber-500/30 text-amber-400 hover:bg-amber-900/50";
										pillIconNode = <span className="font-bold">S</span>;
									} else if (
										statusName.includes("alpa") ||
										statusName.includes("absen") ||
										statusName.includes("alpha")
									) {
										pillTone =
											"bg-rose-950/60 border-rose-500/30 text-rose-400 hover:bg-rose-900/50";
										pillIconNode = <X className="size-3" />;
									}

									return (
										<td
											key={day.dateStr}
											className={`relative border-r border-slate-800/70 p-1.5 text-center ${
												!isSunday ? "bg-blue-950/10" : ""
											}`}
										>
											<div className="relative inline-flex items-center justify-center">
												{/* Status Pill Button - Klik langsung membuka Centered Dialog */}
												<button
													type="button"
													data-testid={`attendance-pill-${row.studentId}-${day.dateStr}`}
													aria-label={`Ubah presensi ${row.fullName} ${day.dateStr}`}
													onClick={() => {
														onCellClick(
															row.studentId,
															row.fullName,
															row.studentNumber,
															day.dateStr,
															cell?.statusId,
															cell?.notes,
														);
													}}
													className={`relative inline-flex h-7 w-14 items-center justify-between rounded-full border px-2.5 text-xs transition-all shadow-sm ${pillTone}`}
												>
													<span className="flex items-center justify-center">
														{pillIconNode}
													</span>
													<ChevronDown className="size-2.5 opacity-60" />

													{/* Note Indicator Glowing Dot */}
													{cell?.notes && (
														<span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-400 ring-2 ring-[#111927]" />
													)}
												</button>
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>

					{/* Matrix Footer: Overall Rate & Ratio per Date */}
					<tfoot>
						<tr className="border-t-2 border-slate-800 bg-[#0d1526] font-bold text-slate-200">
							<td className="sticky left-0 z-20 border-r border-slate-800 bg-[#0d1526] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white">
								Rata-Rata Keseluruhan
							</td>

							{dailyStats.map((stat, i) => (
								<td
									key={monthDays[i]?.dateStr}
									className="border-r border-slate-800/80 px-1 py-2.5 text-center text-[11px]"
								>
									{stat.rate !== null ? (
										<div className="flex flex-col items-center">
											<span className="font-bold text-white">{stat.rate}%</span>
											<span className="text-[10px] text-slate-500">
												({stat.present}/{stat.total})
											</span>
										</div>
									) : (
										<div className="flex flex-col items-center">
											<span className="text-slate-500">0%</span>
											<span className="text-[10px] text-slate-600">
												(0/{rows.length})
											</span>
										</div>
									)}
								</td>
							))}
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
};
