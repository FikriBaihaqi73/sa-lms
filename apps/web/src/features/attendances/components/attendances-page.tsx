import {
	Calendar,
	CheckCircle2,
	Download,
	LayoutDashboard,
	Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useAttendanceSchedules } from "@/features/attendance-schedules/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import {
	useAcademicYearsOptions,
	useAttendanceStatusesOptions,
	useAttendances,
	useBulkUpsertAttendance,
	useClassesOptions,
	useClassStudents,
	useDeleteAttendance,
	useUpsertAttendance,
} from "../hooks";
import type {
	AttendanceMatrixStudentRow,
	AttendanceMonthDay,
	ScheduleOption,
} from "../types";
import { AttendanceFilter } from "./attendance-filter";
import { AttendanceMatrixTable } from "./attendance-matrix-table";
import { AttendanceNoteDialog } from "./attendance-note-popover";
import { AttendanceOverviewTab } from "./attendance-overview-tab";
import { AttendanceStats } from "./attendance-stats";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const ATTENDANCE_DAY_MAP: Record<number, string> = {
	0: "MINGGU",
	1: "SENIN",
	2: "SELASA",
	3: "RABU",
	4: "KAMIS",
	5: "JUMAT",
	6: "SABTU",
};

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

function parseErrorMessage(err: unknown): string {
	if (err instanceof ApiError) {
		if (err.status === 403) {
			return (
				err.message ||
				"Akses ditolak: Operasi presensi dibatasi sesuai hak akses institusi."
			);
		}
		if (err.status === 404) {
			return err.message && err.message !== "Not Found"
				? err.message
				: "Data yang diminta tidak ditemukan.";
		}
		if (err.fieldErrors.length > 0) {
			return `${err.message}: ${err.fieldErrors
				.map(({ field, message }) => `${field || "input"} - ${message}`)
				.join("; ")}`;
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return "Terjadi kesalahan pada sistem. Silakan coba lagi.";
}

export const AttendancesPage: React.FC = () => {
	// Active Tab State ("overview" | "matrix")
	const [activeTab, setActiveTab] = useState<"overview" | "matrix">("matrix");

	// Date & Period state (Defaults to current month and year)
	const now = new Date();
	const [month, setMonth] = useState<number>(now.getMonth() + 1);
	const [year, setYear] = useState<number>(now.getFullYear());

	// Filter States
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [classId, setClassId] = useState("");
	const [scheduleId, setScheduleId] = useState("");
	const [academicYearId, setAcademicYearId] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Notification Toast
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	// Auto-dismiss notice after 4 seconds
	useEffect(() => {
		if (!notice) return;
		const timer = setTimeout(() => setNotice(null), 4000);
		return () => clearTimeout(timer);
	}, [notice]);

	// Dialog State for Student Notes
	const [noteDialogState, setNoteDialogState] = useState<{
		isOpen: boolean;
		studentId: string;
		studentName: string;
		studentNumber: string;
		dateStr: string;
		currentStatusId?: string | null;
		currentNotes?: string | null;
		attendanceId?: string | null;
	}>({
		isOpen: false,
		studentId: "",
		studentName: "",
		studentNumber: "",
		dateStr: "",
	});

	// Dropdown Options Queries
	const { data: classOptions = [] } = useClassesOptions();
	const { data: attendanceSchedulesResponse } = useAttendanceSchedules({
		academicYearId: academicYearId || undefined,
		classId: classId || undefined,
		limit: 100,
	});
	const rawAttendanceSchedules = attendanceSchedulesResponse?.data ?? [];
	const { data: statusOptions = [] } = useAttendanceStatusesOptions();
	const { data: academicYearOptions = [] } = useAcademicYearsOptions();
	const { data: enrolledStudents = [] } = useClassStudents(
		classId || undefined,
	);

	// Auto select active academic year
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

	// Auto select first class if none selected or current selection is invalid
	useEffect(() => {
		if (filteredClassOptions.length > 0) {
			const exists = filteredClassOptions.some((c) => c.id === classId);
			if (!exists) {
				setClassId(filteredClassOptions[0]?.id ?? "");
			}
		} else {
			setClassId("");
		}
	}, [filteredClassOptions, classId]);

	// Build Attendance Schedule Options strictly from AttendanceSchedules
	const attendanceScheduleOptions = useMemo<ScheduleOption[]>(() => {
		if (academicYearId && !classId) {
			return [];
		}

		return rawAttendanceSchedules.map((sch) => ({
			id: sch.id,
			scheduleId: sch.scheduleId || sch.id,
			title: sch.title,
			activeDays: sch.activeDays || [],
			specificDate: sch.specificDate,
			startTime: sch.startTime,
			endTime: sch.endTime,
			isActive: sch.isActive,
			scheduleType: sch.scheduleType,
			isTodayActive: true,
			label: sch.title,
			subjectName: sch.schedule?.classSubject?.subject?.name || sch.title,
			classroomName: sch.schedule?.classroom?.roomName,
			teacherName: sch.schedule?.classSubject?.teacher?.user?.name,
		}));
	}, [rawAttendanceSchedules, academicYearId, classId]);

	// Auto select first schedule when schedule options load or change
	useEffect(() => {
		if (attendanceScheduleOptions.length > 0) {
			const exists = attendanceScheduleOptions.some((s) => s.id === scheduleId);
			if (!exists) {
				setScheduleId(attendanceScheduleOptions[0]?.id ?? "");
			}
		} else {
			setScheduleId("");
		}
	}, [attendanceScheduleOptions, scheduleId]);

	// Selected Class Object
	const selectedClass = useMemo(() => {
		return classOptions.find((c) => c.id === classId);
	}, [classOptions, classId]);

	// Selected Attendance Schedule Object
	const selectedAttendanceSchedule = useMemo(() => {
		return attendanceScheduleOptions.find((s) => s.id === scheduleId);
	}, [attendanceScheduleOptions, scheduleId]);

	const effectiveScheduleId =
		selectedAttendanceSchedule?.scheduleId || scheduleId;

	// Format start and end date for the selected month
	const { startDateStr, endDateStr } = useMemo(() => {
		const daysInMonth = getDaysInMonth(year, month);
		const mStr = String(month).padStart(2, "0");
		return {
			startDateStr: `${year}-${mStr}-01`,
			endDateStr: `${year}-${mStr}-${String(daysInMonth).padStart(2, "0")}`,
		};
	}, [year, month]);

	// Fetch attendances for the entire month
	const {
		data: attendancesResponse,
		isLoading: isAttendancesLoading,
		isError,
		refetch,
	} = useAttendances({
		limit: 1000,
		class_id: classId || undefined,
		schedule_id: effectiveScheduleId || undefined,
		start_date: startDateStr,
		end_date: endDateStr,
	});

	// Mutations
	const upsertMutation = useUpsertAttendance();
	const bulkUpsertMutation = useBulkUpsertAttendance();
	const deleteMutation = useDeleteAttendance();

	const attendances = attendancesResponse?.data ?? [];

	// Generate Month Days (Menyesuaikan Hari Aktif dari Jadwal Absensi yang Dipilih)
	const monthDays: AttendanceMonthDay[] = useMemo(() => {
		const count = getDaysInMonth(year, month);
		const days: AttendanceMonthDay[] = [];
		const mStr = String(month).padStart(2, "0");

		const activeDaysConfig = selectedAttendanceSchedule?.activeDays;
		const activeDaysUpper =
			activeDaysConfig && activeDaysConfig.length > 0
				? activeDaysConfig.map((d) => d.toUpperCase())
				: null;

		for (let d = 1; d <= count; d++) {
			const dStr = String(d).padStart(2, "0");
			const dateStr = `${year}-${mStr}-${dStr}`;
			const dateObj = new Date(year, month - 1, d);
			const dayOfWeek = dateObj.getDay();
			const dayName = DAY_NAMES[dayOfWeek] ?? "";
			const dayFullUpper = ATTENDANCE_DAY_MAP[dayOfWeek] ?? "";

			// Menyesuaikan hari aktif dari jadwal absensi jika dikonfigurasi
			const isScheduleActive = activeDaysUpper
				? activeDaysUpper.includes(dayFullUpper)
				: dayOfWeek !== 0;

			days.push({
				dateStr,
				dayNumber: d,
				dayNumberFormatted: dStr,
				dayName,
				dayOfWeek,
				isScheduleActive,
			});
		}
		return days;
	}, [year, month, selectedAttendanceSchedule]);

	// Build Matrix Rows
	const matrixRows: AttendanceMatrixStudentRow[] = useMemo(() => {
		const studentsMap = new Map<
			string,
			{
				studentId: string;
				fullName: string;
				studentNumber: string;
				className?: string;
			}
		>();

		// 1. Enrolled students from selected class or general lookup
		for (const st of enrolledStudents) {
			if (st.studentId) {
				studentsMap.set(st.studentId, {
					studentId: st.studentId,
					fullName: st.fullName,
					studentNumber: st.studentNumber,
					className: st.className || selectedClass?.name || "Kelas",
				});
			}
		}

		// 2. Include any students with attendance records
		for (const att of attendances) {
			if (att.student_id && !studentsMap.has(att.student_id)) {
				studentsMap.set(att.student_id, {
					studentId: att.student_id,
					fullName: att.student?.profile?.fullName ?? "Siswa",
					studentNumber: att.student?.studentNumber ?? "-",
					className:
						att.schedule?.classSubject?.class?.name ||
						selectedClass?.name ||
						"Kelas",
				});
			}
		}

		// Index attendances by student_id and dateStr
		const attendanceIndex = new Map<string, (typeof attendances)[0]>();
		for (const att of attendances) {
			if (att.student_id && att.attendance_date) {
				const datePart = att.attendance_date.split("T")[0];
				attendanceIndex.set(`${att.student_id}_${datePart}`, att);
			}
		}

		const rows: AttendanceMatrixStudentRow[] = [];

		studentsMap.forEach((student) => {
			const cells: AttendanceMatrixStudentRow["cells"] = {};
			let presentCount = 0;
			let permissionCount = 0;
			let sickCount = 0;
			let absentCount = 0;

			for (const day of monthDays) {
				const record = attendanceIndex.get(
					`${student.studentId}_${day.dateStr}`,
				);
				const statusName = record?.attendance_status?.name ?? null;

				if (statusName) {
					const lower = statusName.toLowerCase();
					if (lower.includes("hadir") || lower === "present") {
						presentCount++;
					} else if (lower.includes("izin") || lower.includes("permit")) {
						permissionCount++;
					} else if (lower.includes("sakit") || lower.includes("sick")) {
						sickCount++;
					} else {
						absentCount++;
					}
				}

				const matchedStatus = record?.attendance_status_id
					? statusOptions.find((s) => s.id === record.attendance_status_id)
					: null;

				cells[day.dateStr] = {
					dateStr: day.dateStr,
					isScheduleActive: day.isScheduleActive,
					attendance: record ?? null,
					statusId: record?.attendance_status_id ?? null,
					statusName: matchedStatus?.name ?? statusName,
					color:
						record?.attendance_status?.color ?? matchedStatus?.color ?? null,
					icon: record?.attendance_status?.icon ?? matchedStatus?.icon ?? null,
					notes: record?.notes ?? null,
				};
			}

			const recordedTotal =
				presentCount + permissionCount + sickCount + absentCount;
			const attendanceRate =
				recordedTotal > 0
					? Math.round((presentCount / recordedTotal) * 100)
					: 0;

			rows.push({
				studentId: student.studentId,
				studentNumber: student.studentNumber,
				fullName: student.fullName,
				className: student.className,
				cells,
				totalPresent: presentCount,
				totalPermission: permissionCount,
				totalSick: sickCount,
				totalAbsent: absentCount,
				attendanceRate,
			});
		});

		// Apply Search filter
		let filtered = rows;
		if (debouncedSearch.trim()) {
			const term = debouncedSearch.toLowerCase().trim();
			filtered = filtered.filter(
				(r) =>
					r.fullName.toLowerCase().includes(term) ||
					r.studentNumber.toLowerCase().includes(term),
			);
		}

		// Apply Status highlight filter
		if (statusFilter) {
			const targetStatus = statusOptions.find((s) => s.id === statusFilter);
			if (targetStatus) {
				const cat = targetStatus.typeCategory;
				filtered = filtered.filter((r) => {
					if (cat === "hadir") return r.totalPresent > 0;
					if (cat === "izin") return r.totalPermission > 0;
					if (cat === "sakit") return r.totalSick > 0;
					if (cat === "alpa") return r.totalAbsent > 0;
					return true;
				});
			}
		}

		return filtered;
	}, [
		enrolledStudents,
		attendances,
		monthDays,
		debouncedSearch,
		statusFilter,
		statusOptions,
		selectedClass,
	]);

	// Summary Stats computed dynamically from current matrix rows
	const summaryData = useMemo(() => {
		let totalPresent = 0;
		let totalPermission = 0;
		let totalSick = 0;
		let totalAbsent = 0;

		for (const row of matrixRows) {
			totalPresent += row.totalPresent;
			totalPermission += row.totalPermission;
			totalSick += row.totalSick;
			totalAbsent += row.totalAbsent;
		}

		const total = totalPresent + totalPermission + totalSick + totalAbsent;
		const attendanceRate =
			total > 0 ? Math.round((totalPresent / total) * 100) : 0;

		return {
			total,
			present: totalPresent,
			permission: totalPermission,
			sick: totalSick,
			absent: totalAbsent,
			attendanceRate,
		};
	}, [matrixRows]);

	// Handlers
	const handleResetFilters = () => {
		setSearch("");
		const defaultAy =
			academicYearOptions.find((a) => a.is_active)?.id ??
			academicYearOptions[0]?.id ??
			"";
		setAcademicYearId(defaultAy);

		const defaultClassOptions = defaultAy
			? classOptions.filter((c) => c.academic_year_id === defaultAy)
			: classOptions;
		const firstClass = defaultClassOptions[0]?.id ?? "";
		setClassId(firstClass);
		setScheduleId("");
		setStatusFilter("");
		setMonth(now.getMonth() + 1);
		setYear(now.getFullYear());
	};

	const handleQuickStatusChange = async (
		studentId: string,
		dateStr: string,
		statusId: string,
	) => {
		const activeSchedId =
			effectiveScheduleId ||
			attendanceScheduleOptions[0]?.scheduleId ||
			attendanceScheduleOptions[0]?.id;
		if (!activeSchedId) {
			setNotice({
				kind: "error",
				message:
					"Pilih jadwal absensi terlebih dahulu sebelum mencatat kehadiran.",
			});
			return;
		}

		try {
			await upsertMutation.mutateAsync({
				schedule_id: activeSchedId,
				student_id: studentId,
				attendance_date: dateStr,
				attendance_status_id: statusId,
			});
			setNotice({
				kind: "success",
				message: "Presensi berhasil diperbarui.",
			});
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseErrorMessage(err),
			});
		}
	};

	const handleBulkMarkPresent = async (dateStr: string) => {
		const activeSchedId =
			effectiveScheduleId ||
			attendanceScheduleOptions[0]?.scheduleId ||
			attendanceScheduleOptions[0]?.id;
		if (!activeSchedId) {
			setNotice({
				kind: "error",
				message:
					"Pilih jadwal absensi terlebih dahulu sebelum melakukan presensi massal.",
			});
			return;
		}

		const hadirStatus = statusOptions.find((s) => s.typeCategory === "hadir");
		if (!hadirStatus) {
			setNotice({
				kind: "error",
				message: "Status 'Hadir' belum dikonfigurasi di sistem.",
			});
			return;
		}

		try {
			const studentIds = matrixRows.map((r) => r.studentId);
			await bulkUpsertMutation.mutateAsync({
				schedule_id: activeSchedId,
				attendance_date: dateStr,
				attendance_status_id: hadirStatus.id,
				student_ids: studentIds.length > 0 ? studentIds : undefined,
			});
			setNotice({
				kind: "success",
				message: `Berhasil menandai semua siswa hadir pada ${dateStr}.`,
			});
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseErrorMessage(err),
			});
		}
	};

	// "Set Semua Hadir Hari Ini" Button Action
	const handleSetAllPresentToday = async () => {
		const today = new Date();
		const tYear = today.getFullYear();
		const tMonth = String(today.getMonth() + 1).padStart(2, "0");
		const tDay = String(today.getDate()).padStart(2, "0");
		const todayDateStr = `${tYear}-${tMonth}-${tDay}`;

		const activeSchedId =
			effectiveScheduleId ||
			attendanceScheduleOptions[0]?.scheduleId ||
			attendanceScheduleOptions[0]?.id;
		if (!activeSchedId) {
			setNotice({
				kind: "error",
				message:
					"Pilih jadwal absensi terlebih dahulu sebelum mencatat kehadiran hari ini.",
			});
			return;
		}

		const hadirStatus = statusOptions.find((s) => s.typeCategory === "hadir");
		if (!hadirStatus) {
			setNotice({
				kind: "error",
				message: "Status 'Hadir' belum dikonfigurasi di sistem.",
			});
			return;
		}

		try {
			const studentIds = matrixRows.map((r) => r.studentId);
			await bulkUpsertMutation.mutateAsync({
				schedule_id: activeSchedId,
				attendance_date: todayDateStr,
				attendance_status_id: hadirStatus.id,
				student_ids: studentIds.length > 0 ? studentIds : undefined,
				notes: "Hadir hari ini",
			});

			// If current view is not the month of today, switch to today's month so it shows
			if (month !== today.getMonth() + 1 || year !== today.getFullYear()) {
				setMonth(today.getMonth() + 1);
				setYear(today.getFullYear());
			}

			setNotice({
				kind: "success",
				message: `Semua siswa berhasil dicatat hadir untuk hari ini (${todayDateStr})!`,
			});
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseErrorMessage(err),
			});
		}
	};

	// "Ekspor Rekap" Button Action
	const handleExportRekap = () => {
		if (matrixRows.length === 0) {
			setNotice({
				kind: "error",
				message: "Tidak ada data presensi untuk diekspor.",
			});
			return;
		}

		const dateHeaders = monthDays.map((d) => d.dateStr);
		const headers = [
			"No",
			"Nama Siswa",
			"NISN",
			"Kelas",
			...dateHeaders,
			"Total Hadir",
			"Total Izin",
			"Total Sakit",
			"Total Alpa",
			"Persentase Kehadiran (%)",
		];

		const rowsData = matrixRows.map((row, idx) => {
			const dateCells = monthDays.map((d) => {
				const cell = row.cells[d.dateStr];
				return cell?.statusName || "-";
			});

			return [
				String(idx + 1),
				`"${row.fullName.replace(/"/g, '""')}"`,
				`"${row.studentNumber || "-"}"`,
				`"${(row.className || selectedClass?.name || "-").replace(/"/g, '""')}"`,
				...dateCells.map((c) => `"${c}"`),
				String(row.totalPresent),
				String(row.totalPermission),
				String(row.totalSick),
				String(row.totalAbsent),
				`${row.attendanceRate}%`,
			].join(",");
		});

		const csvContent =
			"data:text/csv;charset=utf-8,\uFEFF" +
			[headers.join(","), ...rowsData].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute(
			"download",
			`rekap-presensi-${selectedClass?.name || "kelas"}-${year}-${month}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		setNotice({
			kind: "success",
			message: "Rekap presensi berhasil diekspor sebagai file CSV.",
		});
	};

	const handleOpenCellDialog = (
		studentId: string,
		studentName: string,
		studentNumber: string,
		dateStr: string,
		currentStatusId?: string | null,
		currentNotes?: string | null,
	) => {
		const record = attendances.find(
			(a) =>
				a.student_id === studentId &&
				a.attendance_date?.split("T")[0] === dateStr,
		);

		setNoteDialogState({
			isOpen: true,
			studentId,
			studentName,
			studentNumber,
			dateStr,
			currentStatusId,
			currentNotes,
			attendanceId: record?.id,
		});
	};

	const handleSaveCellDialog = async (
		statusId: string,
		notes?: string | null,
	) => {
		const activeSchedId =
			effectiveScheduleId ||
			attendanceScheduleOptions[0]?.scheduleId ||
			attendanceScheduleOptions[0]?.id;
		if (!activeSchedId) {
			setNotice({
				kind: "error",
				message: "Pilih jadwal absensi terlebih dahulu.",
			});
			return;
		}

		try {
			await upsertMutation.mutateAsync({
				schedule_id: activeSchedId,
				student_id: noteDialogState.studentId,
				attendance_date: noteDialogState.dateStr,
				attendance_status_id: statusId,
				notes: notes ?? null,
			});
			setNotice({
				kind: "success",
				message: "Data dan catatan presensi berhasil disimpan.",
			});
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseErrorMessage(err),
			});
		}
	};

	const handleDeleteCellRecord = async () => {
		if (!noteDialogState.attendanceId) return;
		try {
			await deleteMutation.mutateAsync(noteDialogState.attendanceId);
			setNotice({
				kind: "success",
				message: "Data presensi berhasil dihapus.",
			});
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseErrorMessage(err),
			});
		}
	};

	const scheduleTitle = selectedAttendanceSchedule
		? selectedAttendanceSchedule.title
		: selectedClass
			? selectedClass.name
			: undefined;

	const teacherName = selectedAttendanceSchedule?.teacherName;

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-4">
				{/* Top-Right Floating Notification */}
				{notice && (
					<div
						role="status"
						className={`fixed right-6 top-6 z-[70] flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
							notice.kind === "success"
								? "border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/20"
								: "border-rose-500 bg-rose-600 text-white shadow-rose-500/20"
						}`}
					>
						{notice.kind === "success" ? (
							<CheckCircle2 className="size-5 shrink-0" />
						) : (
							<span className="size-2 rounded-full bg-white animate-ping" />
						)}
						<span>{notice.message}</span>
					</div>
				)}

				{/* Navigation Tabs (Overview vs Matrix Presensi) */}
				<div className="flex border-b border-slate-200 dark:border-slate-800">
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setActiveTab("overview")}
							className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
								activeTab === "overview"
									? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
									: "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
							}`}
						>
							<LayoutDashboard className="size-4" />
							<span>Overview & Rangkuman</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("matrix")}
							className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
								activeTab === "matrix"
									? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
									: "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
							}`}
						>
							<Calendar className="size-4" />
							<span>Matriks Presensi Kelas</span>
						</button>
					</div>
				</div>

				{/* TAB 1: OVERVIEW & RANGKUMAN MENYELURUH */}
				{activeTab === "overview" && <AttendanceOverviewTab />}

				{/* TAB 2: MATRIKS PRESENSI KELAS */}
				{activeTab === "matrix" && (
					<div className="space-y-4">
						{/* Header Halaman (1:1 Sesuai Referensi Gambar 2) */}
						<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<div className="flex size-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/30 dark:bg-blue-600/20 dark:text-blue-400">
									<Users className="size-5" />
								</div>
								<div>
									<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
										Matriks Presensi Per Kelas
									</h1>
									<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
										Kelola kehadiran harian siswa secara rinci dengan matriks
										interaktif bulanan.
									</p>
								</div>
							</div>

							{/* Tombol Aksi Kanan Atas: Set Semua Hadir Hari Ini & Ekspor Rekap */}
							<div className="flex flex-wrap items-center gap-2.5">
								<button
									type="button"
									onClick={handleSetAllPresentToday}
									disabled={bulkUpsertMutation.isPending}
									className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
								>
									<CheckCircle2 className="size-3.5" />
									<span>Set Semua Hadir Hari Ini</span>
								</button>

								<button
									type="button"
									onClick={handleExportRekap}
									className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
								>
									<Download className="size-3.5" />
									<span>Ekspor Rekap</span>
								</button>
							</div>
						</header>

						{/* 6 Kartu Statistik Ringkasan (1:1 Sesuai Referensi Gambar 2) */}
						<AttendanceStats
							summary={summaryData}
							isLoading={isAttendancesLoading}
						/>

						{/* Bar Filter Matrix Compact */}
						<AttendanceFilter
							search={search}
							onSearchChange={setSearch}
							classId={classId}
							onClassChange={(val) => {
								setClassId(val);
								setScheduleId("");
							}}
							scheduleId={scheduleId}
							onScheduleChange={setScheduleId}
							academicYearId={academicYearId}
							onAcademicYearChange={(val) => {
								setAcademicYearId(val);
								const nextClasses = classOptions.filter(
									(c) => c.academic_year_id === val,
								);
								const firstClass = nextClasses[0]?.id ?? "";
								setClassId(firstClass);
								setScheduleId("");
							}}
							month={month}
							onMonthChange={setMonth}
							year={year}
							onYearChange={setYear}
							statusFilter={statusFilter}
							onStatusFilterChange={setStatusFilter}
							classOptions={filteredClassOptions}
							statusOptions={statusOptions}
							academicYearOptions={academicYearOptions}
							onReset={handleResetFilters}
							scheduleOptions={attendanceScheduleOptions}
						/>

						{/* Matriks Kehadiran Bulanan */}
						<AttendanceMatrixTable
							monthDays={monthDays}
							rows={matrixRows}
							statusOptions={statusOptions}
							isLoading={isAttendancesLoading}
							isError={isError}
							onRetry={() => refetch()}
							onCellClick={handleOpenCellDialog}
							onQuickStatusChange={handleQuickStatusChange}
							onBulkMarkPresent={handleBulkMarkPresent}
							scheduleTitle={scheduleTitle}
							teacherName={teacherName}
						/>
					</div>
				)}

				{/* Modal / Dialog Detail Catatan Siswa */}
				<AttendanceNoteDialog
					isOpen={noteDialogState.isOpen}
					onClose={() =>
						setNoteDialogState((prev) => ({ ...prev, isOpen: false }))
					}
					studentName={noteDialogState.studentName}
					studentNumber={noteDialogState.studentNumber}
					dateFormatted={noteDialogState.dateStr}
					currentStatusId={noteDialogState.currentStatusId}
					currentNotes={noteDialogState.currentNotes}
					statusOptions={statusOptions}
					isSubmitting={upsertMutation.isPending || deleteMutation.isPending}
					onSave={handleSaveCellDialog}
					onDelete={
						noteDialogState.attendanceId ? handleDeleteCellRecord : undefined
					}
				/>
			</div>
		</main>
	);
};
