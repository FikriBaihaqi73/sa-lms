import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ClipboardList,
	Download,
	Pencil,
	RefreshCw,
	RotateCcw,
	Search,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendanceSchedules } from "@/features/attendance-schedules/hooks";
import { AttendanceStatusIcon } from "@/features/attendance-statuses/components/attendance-status-icon";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import {
	useAcademicYearsOptions,
	useAttendanceStatusesOptions,
	useAttendances,
	useClassesOptions,
	useDeleteAttendance,
	useUpdateAttendance,
} from "../hooks";
import type { Attendance, AttendanceStatusOption } from "../types";
import { EditAttendanceRecordDialog } from "./edit-attendance-record-dialog";

type DatePreset = "today" | "last7" | "thisMonth" | "custom";

function toLocalDateStr(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function getPresetRange(preset: Exclude<DatePreset, "custom">): {
	start: string;
	end: string;
} {
	const now = new Date();
	const end = toLocalDateStr(now);
	if (preset === "today") {
		return { start: end, end };
	}
	if (preset === "last7") {
		const startObj = new Date(now);
		startObj.setDate(now.getDate() - 6);
		return { start: toLocalDateStr(startObj), end };
	}
	// thisMonth
	const startObj = new Date(now.getFullYear(), now.getMonth(), 1);
	const endObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	return { start: toLocalDateStr(startObj), end: toLocalDateStr(endObj) };
}

function formatDisplayDate(dateStr: string | null | undefined): string {
	if (!dateStr) return "-";
	const clean = dateStr.split("T")[0];
	const d = new Date(`${clean}T00:00:00`);
	if (Number.isNaN(d.getTime())) return dateStr;
	return new Intl.DateTimeFormat("id-ID", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(d);
}

function extractTimeHHMM(value: string | null | undefined): string | null {
	if (!value) return null;
	const trimmed = value.trim();
	if (/^\d{2}:\d{2}/.test(trimmed)) {
		return trimmed.slice(0, 5);
	}
	const tIndex = trimmed.indexOf("T");
	if (tIndex !== -1) {
		const timePart = trimmed.slice(tIndex + 1);
		if (/^\d{2}:\d{2}/.test(timePart)) {
			return timePart.slice(0, 5);
		}
	}
	const parsed = new Date(trimmed);
	if (!Number.isNaN(parsed.getTime())) {
		const h = String(parsed.getUTCHours()).padStart(2, "0");
		const m = String(parsed.getUTCMinutes()).padStart(2, "0");
		return `${h}:${m}`;
	}
	return null;
}

function formatSessionTime(record: Attendance): string {
	const timestamp = record.updated_at || record.created_at;
	if (timestamp) {
		const recordedAt = new Date(timestamp);
		if (!Number.isNaN(recordedAt.getTime())) {
			return new Intl.DateTimeFormat("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
			}).format(recordedAt);
		}
	}
	const start = extractTimeHHMM(
		record.attendance_schedule?.startTime || record.schedule?.startTime,
	);
	const end = extractTimeHHMM(
		record.attendance_schedule?.endTime || record.schedule?.endTime,
	);
	if (start && end) {
		return `${start} - ${end}`;
	}
	if (start) {
		return start;
	}
	return "-";
}

function resolveScheduleDisplay(record: Attendance): {
	title: string;
	typeLabel: string;
	isStandalone: boolean;
} {
	if (record.attendance_schedule) {
		const isStandalone =
			record.attendance_schedule.scheduleType === "STANDALONE" ||
			!record.schedule_id;
		return {
			title: record.attendance_schedule.title,
			typeLabel: isStandalone ? "Sesi Mandiri" : "Dari Jadwal",
			isStandalone,
		};
	}
	const subjectName = record.schedule?.classSubject?.subject?.name;
	if (subjectName) {
		return {
			title: subjectName,
			typeLabel: "Dari Jadwal",
			isStandalone: false,
		};
	}
	return {
		title: "-",
		typeLabel: "Sesi Mandiri",
		isStandalone: true,
	};
}

function parseError(err: unknown): string {
	if (err instanceof ApiError) {
		return err.message || "Terjadi kesalahan saat memproses data presensi.";
	}
	if (err instanceof Error) return err.message;
	return "Terjadi kesalahan pada sistem. Silakan coba lagi.";
}

export const AttendanceListTab: React.FC = () => {
	const initialRange = useMemo(() => getPresetRange("thisMonth"), []);

	// Filters
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [academicYearId, setAcademicYearId] = useState("");
	const [classId, setClassId] = useState("");
	const [attendanceScheduleId, setAttendanceScheduleId] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [datePreset, setDatePreset] = useState<DatePreset>("thisMonth");
	const [startDate, setStartDate] = useState(initialRange.start);
	const [endDate, setEndDate] = useState(initialRange.end);

	// Pagination
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(20);

	// Dialog & Feedback State
	const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
	const [deletingRecord, setDeletingRecord] = useState<Attendance | null>(null);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		if (!notice) return;
		const timer = setTimeout(() => setNotice(null), 4000);
		return () => clearTimeout(timer);
	}, [notice]);

	// Master Options Queries
	const { data: academicYearOptions = [] } = useAcademicYearsOptions();
	const { data: classOptions = [] } = useClassesOptions();
	const { data: statusOptions = [] } = useAttendanceStatusesOptions();
	const { data: attendanceSchedulesResponse } = useAttendanceSchedules({
		academicYearId: academicYearId || undefined,
		classId: classId || undefined,
		limit: 100,
	});
	const attendanceScheduleOptions = attendanceSchedulesResponse?.data ?? [];

	// Auto-select active academic year on mount
	useEffect(() => {
		if (!academicYearId && academicYearOptions.length > 0) {
			const active = academicYearOptions.find((ay) => ay.is_active);
			setAcademicYearId(
				active ? active.id : (academicYearOptions[0]?.id ?? ""),
			);
		}
	}, [academicYearOptions, academicYearId]);

	// Filter classes strictly matching selected academic year
	const filteredClassOptions = useMemo(() => {
		if (!academicYearId) return classOptions;
		return classOptions.filter((c) => c.academic_year_id === academicYearId);
	}, [classOptions, academicYearId]);

	// Main Attendances Query
	const {
		data: attendancesResponse,
		isLoading,
		isError,
		refetch,
	} = useAttendances({
		page,
		limit,
		search: debouncedSearch || undefined,
		academic_year_id: academicYearId || undefined,
		class_id: classId || undefined,
		attendance_schedule_id: attendanceScheduleId || undefined,
		attendance_status_id: statusFilter || undefined,
		start_date: startDate || undefined,
		end_date: endDate || undefined,
		sort_order: "desc",
	});

	const records = attendancesResponse?.data ?? [];
	const meta = attendancesResponse?.meta ?? {
		currentPage: page,
		perPage: limit,
		totalData: records.length,
		totalPages: 1,
	};

	const updateMutation = useUpdateAttendance();
	const deleteMutation = useDeleteAttendance();

	const handlePresetChange = (preset: Exclude<DatePreset, "custom">) => {
		const range = getPresetRange(preset);
		setDatePreset(preset);
		setStartDate(range.start);
		setEndDate(range.end);
		setPage(1);
	};

	const handleResetFilters = () => {
		const defaultAy =
			academicYearOptions.find((a) => a.is_active)?.id ??
			academicYearOptions[0]?.id ??
			"";
		const range = getPresetRange("thisMonth");
		setSearch("");
		setAcademicYearId(defaultAy);
		setClassId("");
		setAttendanceScheduleId("");
		setStatusFilter("");
		setDatePreset("thisMonth");
		setStartDate(range.start);
		setEndDate(range.end);
		setPage(1);
	};

	const handleSaveEdit = async (
		id: string,
		statusId: string,
		notes: string | null,
	) => {
		try {
			await updateMutation.mutateAsync({
				id,
				data: {
					attendance_status_id: statusId,
					notes,
				},
			});
			setNotice({
				kind: "success",
				message: "Status dan catatan presensi berhasil diperbarui.",
			});
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseError(err),
			});
		}
	};

	const handleConfirmDelete = async () => {
		if (!deletingRecord) return;
		try {
			await deleteMutation.mutateAsync(deletingRecord.id);
			setNotice({
				kind: "success",
				message: "Catatan presensi berhasil dihapus.",
			});
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseError(err),
			});
		} finally {
			setDeletingRecord(null);
		}
	};

	const handleExportCsv = () => {
		if (records.length === 0) {
			setNotice({
				kind: "error",
				message: "Tidak ada data presensi untuk diekspor.",
			});
			return;
		}

		const headers = [
			"No",
			"Tanggal",
			"Waktu",
			"Nama Siswa",
			"NISN",
			"Kelas",
			"Jadwal Absensi",
			"Tipe Jadwal",
			"Status Kehadiran",
			"Catatan",
		];

		const rows = records.map((rec, idx) => {
			const sched = resolveScheduleDisplay(rec);
			const className =
				rec.attendance_schedule?.class?.name ||
				rec.schedule?.classSubject?.class?.name ||
				"-";
			const statusMeta = statusOptions.find(
				(s) => s.id === rec.attendance_status_id,
			);
			const statusName = rec.attendance_status?.name || statusMeta?.name || "-";
			return [
				String((meta.currentPage - 1) * meta.perPage + idx + 1),
				`"${formatDisplayDate(rec.attendance_date)}"`,
				`"${formatSessionTime(rec)}"`,
				`"${(rec.student?.profile?.fullName || "-").replace(/"/g, '""')}"`,
				`"${rec.student?.studentNumber || "-"}"`,
				`"${className.replace(/"/g, '""')}"`,
				`"${sched.title.replace(/"/g, '""')}"`,
				`"${sched.typeLabel}"`,
				`"${statusName.replace(/"/g, '""')}"`,
				`"${(rec.notes || "-").replace(/"/g, '""')}"`,
			].join(",");
		});

		const csv = `data:text/csv;charset=utf-8,\uFEFF${[headers.join(","), ...rows].join("\n")}`;
		const link = document.createElement("a");
		link.setAttribute("href", encodeURI(csv));
		link.setAttribute(
			"download",
			`daftar-presensi-siswa-${startDate || "all"}-${endDate || "all"}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		setNotice({
			kind: "success",
			message: "Daftar presensi berhasil diekspor ke file CSV.",
		});
	};

	const statusMap = useMemo(() => {
		const map = new Map<string, AttendanceStatusOption>();
		for (const st of statusOptions) {
			map.set(st.id, st);
		}
		return map;
	}, [statusOptions]);

	const rangeStart =
		meta.totalData === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1;
	const rangeEnd = Math.min(meta.currentPage * meta.perPage, meta.totalData);

	return (
		<div className="space-y-4">
			{/* Floating Notice */}
			{notice && (
				<div
					role="status"
					className={`fixed right-6 top-6 z-[70] flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold shadow-2xl transition-all duration-300 ${
						notice.kind === "success"
							? "border-emerald-500 bg-emerald-600 text-white"
							: "border-rose-500 bg-rose-600 text-white"
					}`}
				>
					{notice.kind === "success" ? (
						<CheckCircle2 className="size-5 shrink-0" />
					) : (
						<AlertCircle className="size-5 shrink-0" />
					)}
					<span>{notice.message}</span>
				</div>
			)}

			{/* Header Section */}
			<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/30 dark:bg-blue-600/20 dark:text-blue-400">
						<ClipboardList className="size-5" />
					</div>
					<div>
						<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							Daftar Presensi Siswa
						</h1>
						<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
							Log riwayat kehadiran siswa secara kronologis berdasarkan tanggal,
							kelas, dan jadwal absensi.
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={handleExportCsv}
					className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
				>
					<Download className="size-3.5" />
					<span>Ekspor Daftar</span>
				</button>
			</header>

			{/* Filter Bar */}
			<div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				<div className="flex flex-wrap items-center gap-2.5">
					{/* 1. Pencarian */}
					<div className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
						<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
						<input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							placeholder="Cari nama / NISN siswa..."
							className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
						/>
					</div>

					{/* 2. Tahun Ajaran */}
					<div className="min-w-[145px] sm:max-w-[190px]">
						<select
							value={academicYearId}
							onChange={(e) => {
								setAcademicYearId(e.target.value);
								setClassId("");
								setAttendanceScheduleId("");
								setPage(1);
							}}
							aria-label="Filter Tahun Ajaran Daftar"
							className="h-9 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						>
							<option value="">Semua Tahun Ajaran</option>
							{academicYearOptions.map((ay) => {
								const displayLabel =
									ay.label ||
									`${ay.name || ay.academic_year || "Tahun Ajaran"} (${ay.is_active ? "Aktif" : "Tidak Aktif"})`;
								return (
									<option key={ay.id} value={ay.id}>
										{displayLabel}
									</option>
								);
							})}
						</select>
					</div>

					{/* 3. Kelas */}
					<div className="min-w-[130px] sm:max-w-[170px]">
						<select
							value={classId}
							onChange={(e) => {
								setClassId(e.target.value);
								setAttendanceScheduleId("");
								setPage(1);
							}}
							aria-label="Filter Kelas Daftar"
							className="h-9 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						>
							<option value="">Semua Kelas</option>
							{filteredClassOptions.map((cls) => (
								<option key={cls.id} value={cls.id}>
									{cls.name} {cls.grade_level ? `(Kls ${cls.grade_level})` : ""}
								</option>
							))}
						</select>
					</div>

					{/* 4. Jadwal Absensi */}
					<div className="min-w-[160px] flex-1 sm:max-w-[220px]">
						<select
							value={attendanceScheduleId}
							onChange={(e) => {
								setAttendanceScheduleId(e.target.value);
								setPage(1);
							}}
							aria-label="Filter Jadwal Absensi Daftar"
							className="h-9 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						>
							<option value="">Semua Jadwal Absensi</option>
							{attendanceScheduleOptions.map((sch) => (
								<option key={sch.id} value={sch.id}>
									{sch.title}
								</option>
							))}
						</select>
					</div>

					{/* 5. Filter Tanggal (Rentang & Quick Presets) */}
					<div className="flex flex-wrap items-center gap-1.5">
						<div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700/60 dark:bg-[#0c1322]">
							{(
								[
									{ key: "today", label: "Hari Ini" },
									{ key: "last7", label: "7 Hari Terakhir" },
									{ key: "thisMonth", label: "Bulan Ini" },
								] as const
							).map((item) => (
								<button
									key={item.key}
									type="button"
									onClick={() => handlePresetChange(item.key)}
									className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
										datePreset === item.key
											? "bg-blue-600 text-white shadow-sm"
											: "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
									}`}
								>
									{item.label}
								</button>
							))}
						</div>

						<input
							type="date"
							value={startDate}
							onChange={(e) => {
								setDatePreset("custom");
								setStartDate(e.target.value);
								setPage(1);
							}}
							aria-label="Tanggal Mulai"
							className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						/>
						<span className="text-xs text-slate-400">–</span>
						<input
							type="date"
							value={endDate}
							onChange={(e) => {
								setDatePreset("custom");
								setEndDate(e.target.value);
								setPage(1);
							}}
							aria-label="Tanggal Akhir"
							className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						/>
					</div>

					{/* 6. Status Kehadiran */}
					<div className="min-w-[125px] sm:max-w-[160px]">
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setPage(1);
							}}
							aria-label="Filter Status Daftar"
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

					{/* 7. Tombol Reset */}
					<button
						type="button"
						onClick={handleResetFilters}
						title="Reset Seluruh Filter"
						aria-label="Reset Filter Daftar"
						className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
					>
						<RotateCcw className="size-3.5" />
					</button>
				</div>
			</div>

			{/* Error State */}
			{isError ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-red-900/30 bg-red-950/20 p-12 text-center">
					<AlertCircle className="size-10 text-red-400" />
					<h3 className="mt-3 text-sm font-semibold text-white">
						Gagal memuat daftar presensi siswa
					</h3>
					<p className="mt-1 text-xs text-slate-400">
						Terjadi kendala saat mengambil riwayat presensi dari server.
					</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
					>
						<RefreshCw className="size-3.5" />
						Coba Lagi
					</button>
				</div>
			) : isLoading ? (
				/* Skeleton Loading */
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
					<div className="space-y-3 p-4">
						{["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((rowKey) => (
							<div key={rowKey} className="flex items-center gap-4">
								<Skeleton className="h-9 w-32 bg-slate-200 dark:bg-slate-800" />
								<Skeleton className="h-9 flex-1 bg-slate-200 dark:bg-slate-800" />
								<Skeleton className="h-9 w-40 bg-slate-200 dark:bg-slate-800" />
								<Skeleton className="h-7 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
								<Skeleton className="h-9 w-28 bg-slate-200 dark:bg-slate-800" />
							</div>
						))}
					</div>
				</div>
			) : records.length === 0 ? (
				/* Empty State */
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm dark:border-slate-800 dark:bg-[#111927]">
					<ClipboardList className="size-11 text-slate-400 dark:text-slate-600" />
					<h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
						Belum ada data presensi ditemukan
					</h3>
					<p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
						Tidak ada catatan presensi yang sesuai dengan filter atau rentang
						tanggal yang dipilih.
					</p>
				</div>
			) : (
				/* Chronological Table */
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-left text-xs">
							<thead>
								<tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-[#0c1322]/80 dark:text-slate-400">
									<th className="px-4 py-3">Tanggal & Waktu</th>
									<th className="px-4 py-3">Siswa & Kelas</th>
									<th className="px-4 py-3">Jadwal Absensi</th>
									<th className="px-4 py-3">Status Kehadiran</th>
									<th className="px-4 py-3">Catatan</th>
									<th className="px-4 py-3 text-right">Aksi</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
								{records.map((rec) => {
									const sched = resolveScheduleDisplay(rec);
									const className =
										rec.attendance_schedule?.class?.name ||
										rec.schedule?.classSubject?.class?.name ||
										"-";
									const masterStatus = statusMap.get(rec.attendance_status_id);
									const statusColor =
										rec.attendance_status?.color ||
										masterStatus?.color ||
										"#2563EB";
									const statusIcon =
										rec.attendance_status?.icon || masterStatus?.icon;
									const statusName =
										rec.attendance_status?.name || masterStatus?.name || "-";

									return (
										<tr
											key={rec.id}
											className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
										>
											{/* 1. Tanggal & Waktu */}
											<td className="whitespace-nowrap px-4 py-3">
												<p className="font-semibold text-slate-800 dark:text-slate-100">
													{formatDisplayDate(rec.attendance_date)}
												</p>
												<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
													{formatSessionTime(rec)}
												</p>
											</td>

											{/* 2. Siswa & Kelas */}
											<td className="px-4 py-3">
												<p className="font-semibold text-slate-900 dark:text-white">
													{rec.student?.profile?.fullName || "Siswa"}
												</p>
												<div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
													<span>{rec.student?.studentNumber || "-"}</span>
													<span>•</span>
													<span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
														{className}
													</span>
												</div>
											</td>

											{/* 3. Jadwal Absensi */}
											<td className="px-4 py-3">
												<p className="font-medium text-slate-800 dark:text-slate-200">
													{sched.title}
												</p>
												<span
													className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
														sched.isStandalone
															? "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
															: "border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
													}`}
												>
													{sched.typeLabel}
												</span>
											</td>

											{/* 4. Status Kehadiran */}
											<td className="whitespace-nowrap px-4 py-3">
												<span
													className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
													style={{
														borderColor: `${statusColor}45`,
														backgroundColor: `${statusColor}18`,
														color: statusColor,
													}}
												>
													<AttendanceStatusIcon
														icon={statusIcon}
														className="size-3.5 shrink-0"
													/>
													<span>{statusName}</span>
												</span>
											</td>

											{/* 5. Catatan */}
											<td className="max-w-[220px] px-4 py-3 text-slate-600 dark:text-slate-300">
												<p className="line-clamp-2">
													{rec.notes?.trim() ? rec.notes : "-"}
												</p>
											</td>

											{/* 6. Aksi */}
											<td className="whitespace-nowrap px-4 py-3 text-right">
												<div className="inline-flex items-center gap-1.5">
													<button
														type="button"
														onClick={() => setEditingRecord(rec)}
														className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
													>
														<Pencil className="size-3" />
														<span>Ubah</span>
													</button>
													<button
														type="button"
														onClick={() => setDeletingRecord(rec)}
														aria-label={`Hapus presensi ${rec.student?.profile?.fullName || "siswa"}`}
														className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
													>
														<Trash2 className="size-3" />
														<span>Hapus</span>
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{/* Pagination Footer */}
					<div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row dark:border-slate-800/80 dark:text-slate-400">
						<div className="flex items-center gap-3">
							<span>
								Menampilkan{" "}
								<strong className="font-semibold text-slate-800 dark:text-slate-200">
									{rangeStart}–{rangeEnd}
								</strong>{" "}
								dari{" "}
								<strong className="font-semibold text-slate-800 dark:text-slate-200">
									{meta.totalData}
								</strong>{" "}
								data presensi
							</span>

							<select
								value={limit}
								onChange={(e) => {
									setLimit(Number(e.target.value));
									setPage(1);
								}}
								aria-label="Jumlah baris per halaman"
								className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#0c1322] dark:text-slate-200"
							>
								<option value={10}>10 / halaman</option>
								<option value={20}>20 / halaman</option>
								<option value={50}>50 / halaman</option>
							</select>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={meta.currentPage <= 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							>
								<ChevronLeft className="size-3.5" />
								<span>Sebelumnya</span>
							</button>
							<span className="px-2 font-medium text-slate-700 dark:text-slate-300">
								Halaman {meta.currentPage} dari {Math.max(1, meta.totalPages)}
							</span>
							<button
								type="button"
								disabled={meta.currentPage >= meta.totalPages}
								onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
								className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							>
								<span>Berikutnya</span>
								<ChevronRight className="size-3.5" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Quick Edit Dialog */}
			<EditAttendanceRecordDialog
				isOpen={Boolean(editingRecord)}
				onClose={() => setEditingRecord(null)}
				record={editingRecord}
				statusOptions={statusOptions}
				isSubmitting={updateMutation.isPending}
				onSave={handleSaveEdit}
			/>

			{/* Delete Confirmation AlertDialog */}
			<AlertDialog
				open={Boolean(deletingRecord)}
				onOpenChange={(open) => !open && setDeletingRecord(null)}
			>
				<AlertDialogContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-[#0f172a] dark:text-slate-100">
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Catatan Presensi?</AlertDialogTitle>
						<AlertDialogDescription className="text-slate-500 dark:text-slate-400">
							Catatan presensi untuk{" "}
							<strong className="text-slate-800 dark:text-slate-200">
								{deletingRecord?.student?.profile?.fullName || "siswa ini"}
							</strong>{" "}
							pada tanggal{" "}
							<strong className="text-slate-800 dark:text-slate-200">
								{formatDisplayDate(deletingRecord?.attendance_date)}
							</strong>{" "}
							akan dihapus. Tindakan ini akan langsung memperbarui ringkasan dan
							matriks presensi.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
							Batal
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							disabled={deleteMutation.isPending}
							className="bg-rose-600 text-white hover:bg-rose-700"
						>
							{deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
