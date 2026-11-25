import { CalendarPlus, Plus } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import type { UpsertAttendanceSchedulePayload } from "../api";
import {
	useAttendanceScheduleAcademicYears,
	useAttendanceScheduleClasses,
	useAttendanceScheduleOptions,
	useAttendanceSchedules,
	useCreateAttendanceSchedule,
	useDeleteAttendanceSchedule,
	useToggleAttendanceScheduleStatus,
	useUpdateAttendanceSchedule,
	useUpdateAttendanceScheduleDays,
} from "../hooks";
import type {
	AttendanceDay,
	AttendanceScheduleItem,
	AttendanceScheduleType,
} from "../types";
import { AttendanceScheduleDialog } from "./AttendanceScheduleDialog";
import { AttendanceSchedulesFilter } from "./AttendanceSchedulesFilter";
import { AttendanceSchedulesStats } from "./AttendanceSchedulesStats";
import { AttendanceSchedulesTable } from "./AttendanceSchedulesTable";
import { DeleteAttendanceScheduleDialog } from "./DeleteAttendanceScheduleDialog";

function extractErrorMessage(err: unknown): string {
	if (err instanceof ApiError) {
		if (err.fieldErrors.length > 0) {
			return `${err.message}: ${err.fieldErrors.map((e) => e.message).join("; ")}`;
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return "Terjadi kesalahan. Silakan coba lagi.";
}

export const AttendanceSchedulesPage: React.FC = () => {
	const [academicYearId, setAcademicYearId] = useState("");
	const [classId, setClassId] = useState("");
	const [scheduleType, setScheduleType] = useState<AttendanceScheduleType | "">(
		"",
	);
	const [isActive, setIsActive] = useState<"true" | "false" | "">("");
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [page, setPage] = useState(1);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<AttendanceScheduleItem | null>(
		null,
	);
	const [deletingItem, setDeletingItem] =
		useState<AttendanceScheduleItem | null>(null);
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	const { data: academicYears = [] } = useAttendanceScheduleAcademicYears();
	const { data: allClasses = [] } = useAttendanceScheduleClasses();
	const { data: scheduleOptions = [] } = useAttendanceScheduleOptions();

	// Default academic year to active year
	useEffect(() => {
		if (!academicYearId && academicYears.length > 0) {
			const activeYear =
				academicYears.find((y) => y.is_active) ?? academicYears[0];
			if (activeYear) {
				setAcademicYearId(activeYear.id);
			}
		}
	}, [academicYearId, academicYears]);

	const filteredClasses = useMemo(() => {
		if (!academicYearId) return allClasses;
		return allClasses.filter((c) => c.academic_year_id === academicYearId);
	}, [allClasses, academicYearId]);

	const {
		data: listResult,
		isLoading,
		isError,
		error,
	} = useAttendanceSchedules({
		academicYearId: academicYearId || undefined,
		classId: classId || undefined,
		scheduleType,
		isActive,
		search: debouncedSearch || undefined,
		page,
		limit: 20,
	});

	const createMutation = useCreateAttendanceSchedule();
	const updateMutation = useUpdateAttendanceSchedule();
	const toggleStatusMutation = useToggleAttendanceScheduleStatus();
	const updateDaysMutation = useUpdateAttendanceScheduleDays();
	const deleteMutation = useDeleteAttendanceSchedule();

	useEffect(() => {
		if (!notice) return;
		const timer = setTimeout(() => setNotice(null), 4000);
		return () => clearTimeout(timer);
	}, [notice]);

	const handleOpenCreate = () => {
		setEditingItem(null);
		setDialogOpen(true);
	};

	const handleOpenEdit = (item: AttendanceScheduleItem) => {
		setEditingItem(item);
		setDialogOpen(true);
	};

	const handleSave = async (payload: UpsertAttendanceSchedulePayload) => {
		try {
			if (editingItem) {
				await updateMutation.mutateAsync({ id: editingItem.id, payload });
				setNotice({
					kind: "success",
					message: "Jadwal absensi berhasil diperbarui.",
				});
			} else {
				await createMutation.mutateAsync(payload);
				setNotice({
					kind: "success",
					message: "Jadwal absensi baru berhasil ditambahkan.",
				});
			}
			setDialogOpen(false);
		} catch (err) {
			setNotice({ kind: "error", message: extractErrorMessage(err) });
		}
	};

	const handleToggleDay = async (
		item: AttendanceScheduleItem,
		nextDays: AttendanceDay[],
	) => {
		setUpdatingId(item.id);
		try {
			await updateDaysMutation.mutateAsync({
				id: item.id,
				activeDays: nextDays,
			});
			setNotice({
				kind: "success",
				message: `Hari aktif "${item.title}" diperbarui.`,
			});
		} catch (err) {
			setNotice({ kind: "error", message: extractErrorMessage(err) });
		} finally {
			setUpdatingId(null);
		}
	};

	const handleToggleStatus = async (
		item: AttendanceScheduleItem,
		nextActive: boolean,
	) => {
		setUpdatingId(item.id);
		try {
			await toggleStatusMutation.mutateAsync({
				id: item.id,
				isActive: nextActive,
			});
			setNotice({
				kind: "success",
				message: `Jadwal "${item.title}" ${nextActive ? "diaktifkan" : "dinonaktifkan"}.`,
			});
		} catch (err) {
			setNotice({ kind: "error", message: extractErrorMessage(err) });
		} finally {
			setUpdatingId(null);
		}
	};

	const handleConfirmDelete = async () => {
		if (!deletingItem) return;
		try {
			await deleteMutation.mutateAsync(deletingItem.id);
			setNotice({
				kind: "success",
				message: `Jadwal "${deletingItem.title}" berhasil dihapus.`,
			});
			setDeletingItem(null);
		} catch (err) {
			setNotice({ kind: "error", message: extractErrorMessage(err) });
		}
	};

	const handleReset = () => {
		const activeYear =
			academicYears.find((y) => y.is_active) ?? academicYears[0];
		setAcademicYearId(activeYear?.id ?? "");
		setClassId("");
		setScheduleType("");
		setIsActive("");
		setSearch("");
		setPage(1);
	};

	return (
		<div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
						<CalendarPlus className="size-6" />
					</div>
					<div>
						<p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
							MANAJEMEN KEHADIRAN
						</p>
						<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
							Kelola &amp; Tambah Jadwal Absensi
						</h1>
						<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
							Atur jadwal absensi reguler dari jadwal pelajaran maupun sesi
							mandiri (harian/pengganti), hari aktif, serta status
							aktif/nonaktif.
						</p>
					</div>
				</div>

				<Button
					type="button"
					onClick={handleOpenCreate}
					className="bg-blue-600 text-white hover:bg-blue-500 shadow-sm shrink-0"
				>
					<Plus className="mr-1.5 size-4" />
					Tambah Jadwal Absensi
				</Button>
			</div>

			{/* Notice Banner */}
			{notice && (
				<div
					role="status"
					className={`rounded-xl border px-4 py-3 text-xs font-medium ${
						notice.kind === "success"
							? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
							: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300"
					}`}
				>
					{notice.message}
				</div>
			)}

			{isError && (
				<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300">
					Gagal memuat jadwal absensi: {extractErrorMessage(error)}
				</div>
			)}

			{/* 4 Stats Cards */}
			<AttendanceSchedulesStats
				stats={listResult?.stats}
				isLoading={isLoading}
			/>

			{/* Top-Down Filter Bar */}
			<AttendanceSchedulesFilter
				academicYears={academicYears}
				classes={filteredClasses}
				academicYearId={academicYearId}
				classId={classId}
				scheduleType={scheduleType}
				isActive={isActive}
				search={search}
				onAcademicYearChange={(val) => {
					setAcademicYearId(val);
					setClassId("");
					setPage(1);
				}}
				onClassChange={(val) => {
					setClassId(val);
					setPage(1);
				}}
				onScheduleTypeChange={(val) => {
					setScheduleType(val);
					setPage(1);
				}}
				onIsActiveChange={(val) => {
					setIsActive(val);
					setPage(1);
				}}
				onSearchChange={(val) => {
					setSearch(val);
					setPage(1);
				}}
				onReset={handleReset}
			/>

			{/* Table */}
			<AttendanceSchedulesTable
				rows={listResult?.data ?? []}
				isLoading={isLoading}
				updatingId={updatingId}
				onToggleDay={handleToggleDay}
				onToggleStatus={handleToggleStatus}
				onEdit={handleOpenEdit}
				onDelete={setDeletingItem}
			/>

			{/* Pagination */}
			{listResult && listResult.meta.totalPages > 1 && (
				<div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
					<span>
						Halaman {listResult.meta.currentPage} dari{" "}
						{listResult.meta.totalPages} ({listResult.meta.totalData} jadwal)
					</span>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Sebelumnya
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={page >= listResult.meta.totalPages}
							onClick={() => setPage((p) => p + 1)}
						>
							Berikutnya
						</Button>
					</div>
				</div>
			)}

			{/* Create / Edit Modal */}
			<AttendanceScheduleDialog
				open={dialogOpen}
				editingItem={editingItem}
				academicYears={academicYears}
				classes={allClasses}
				schedules={scheduleOptions}
				defaultAcademicYearId={academicYearId}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
				onOpenChange={setDialogOpen}
				onSubmit={handleSave}
			/>

			{/* Delete Confirmation */}
			<DeleteAttendanceScheduleDialog
				open={Boolean(deletingItem)}
				item={deletingItem}
				isDeleting={deleteMutation.isPending}
				onOpenChange={(open) => {
					if (!open) setDeletingItem(null);
				}}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
};
