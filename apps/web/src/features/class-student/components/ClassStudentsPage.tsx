import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import {
	useBatchCreateClassStudents,
	useBatchDeleteClassStudents,
	useClassesOptions,
	useClassStudents,
	useClassStudentsSummary,
	useDeleteClassStudent,
	useRestoreClassStudent,
} from "../hooks/useClassStudents";
import type { AddClassStudentFormValues } from "../schemas/classStudentSchema";
import type { ClassStudentItem, ClassStudentStatusFilter } from "../types";
import { getCorrectedPage } from "../utils";
import { ClassStudentDialog } from "./ClassStudentDialog";
import { ClassStudentsFilter } from "./ClassStudentsFilter";
import { ClassStudentsHeader } from "./ClassStudentsHeader";
import { ClassStudentsStats } from "./ClassStudentsStats";
import { ClassStudentsTable } from "./ClassStudentsTable";
import { RemoveClassStudentDialog } from "./RemoveClassStudentDialog";

function errorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.fieldErrors.length > 0) {
			return `${error.message}: ${error.fieldErrors
				.map(({ field, message }) => `${field || "field"} - ${message}`)
				.join("; ")}`;
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan. Silakan coba lagi.";
}

export function ClassStudentsPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search);
	const [selectedClassId, setSelectedClassId] = useState("");
	const [selectedStatus, setSelectedStatus] =
		useState<ClassStudentStatusFilter>("active");
	const [currentPage, setCurrentPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const [isAdding, setIsAdding] = useState(false);
	const [removingItem, setRemovingItem] = useState<ClassStudentItem | null>(
		null,
	);
	const [isBulkRemoving, setIsBulkRemoving] = useState(false);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	// Auto-clear notification banner
	useEffect(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(null), 5000);
		return () => window.clearTimeout(timer);
	}, [notice]);

	// Queries
	const classesQuery = useClassesOptions();
	const classesList = classesQuery.data ?? [];

	const listQuery = useClassStudents({
		page: currentPage,
		limit,
		search: debouncedSearch.trim(),
		classId: selectedClassId || undefined,
		status: selectedStatus,
	});

	const summaryQuery = useClassStudentsSummary(selectedClassId || undefined);

	// Mutations
	const batchCreateMutation = useBatchCreateClassStudents();
	const deleteMutation = useDeleteClassStudent();
	const batchDeleteMutation = useBatchDeleteClassStudents();
	const restoreMutation = useRestoreClassStudent();

	const rows = Array.isArray(listQuery.data?.data) ? listQuery.data.data : [];
	const meta = listQuery.data?.meta ?? null;

	// Nama kelas terpilih untuk label kartu
	const selectedClassName = useMemo(() => {
		if (!selectedClassId) return null;
		return classesList.find((c) => c.id === selectedClassId)?.name ?? null;
	}, [classesList, selectedClassId]);

	// Reset halaman dan pilihan checkbox saat search atau filter berubah
	const handleSearchChange = (value: string) => {
		setSearch(value);
		setCurrentPage(1);
		setSelectedIds(new Set());
	};

	const handleClassChange = (classId: string) => {
		setSelectedClassId(classId);
		setCurrentPage(1);
		setSelectedIds(new Set());
	};

	const handleStatusChange = (status: ClassStudentStatusFilter) => {
		setSelectedStatus(status);
		setCurrentPage(1);
		setSelectedIds(new Set());
	};

	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setCurrentPage(1);
		setSelectedIds(new Set());
	};

	// Selection Checkbox handlers
	const handleToggleSelectRow = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleToggleSelectAll = () => {
		const isAllSelected =
			rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
		if (isAllSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(rows.map((r) => r.id)));
		}
	};

	// 3.9 Handler: Tambah Siswa ke Kelas
	const handleCreate = async (
		values: AddClassStudentFormValues,
		className: string,
	) => {
		try {
			await batchCreateMutation.mutateAsync({
				classId: values.classId,
				studentIds: values.studentIds,
			});

			setIsAdding(false);
			setSelectedStatus("active");
			setCurrentPage(1);
			setSelectedIds(new Set());

			const count = values.studentIds.length;
			const successMsg = `${count} siswa ditambahkan ke ${className}`;
			toast.success(successMsg);
			setNotice({ kind: "success", message: successMsg });
		} catch (err) {
			const errText = errorMessage(err);
			toast.error(errText);
			setNotice({ kind: "error", message: errText });
		}
	};

	// 3.10 Handler: Keluarkan dari Kelas (Single atau Bulk)
	const handleConfirmRemove = async () => {
		try {
			if (isBulkRemoving) {
				const ids = Array.from(selectedIds);
				await batchDeleteMutation.mutateAsync(ids);
				const count = ids.length;
				const msg = `${count} siswa dikeluarkan dari kelas`;
				toast.success(msg);
				setNotice({ kind: "success", message: msg });
				setSelectedIds(new Set());
				setIsBulkRemoving(false);

				// Koreksi halaman jika seluruh baris di halaman habis
				if (meta) {
					const remaining = Math.max(0, rows.length - count);
					setCurrentPage(
						getCorrectedPage(currentPage, remaining, meta.totalPages),
					);
				}
			} else if (removingItem) {
				await deleteMutation.mutateAsync(removingItem.id);
				const studentName =
					removingItem.student?.profile?.fullName ||
					(removingItem.student?.studentNumber
						? `Siswa #${removingItem.student.studentNumber}`
						: "Siswa");
				const msg = `${studentName} dikeluarkan dari kelas`;
				toast.success(msg);
				setNotice({ kind: "success", message: msg });
				setRemovingItem(null);

				// Koreksi halaman jika baris terakhir dihapus
				if (meta && rows.length <= 1) {
					setCurrentPage(getCorrectedPage(currentPage, 0, meta.totalPages));
				}
			}
		} catch (err) {
			const errText = errorMessage(err);
			toast.error(errText);
			setNotice({ kind: "error", message: errText });
		}
	};

	// 3.11 Handler: Pulihkan ke Kelas (Langsung tanpa dialog konfirmasi)
	const handleRestore = async (item: ClassStudentItem) => {
		try {
			await restoreMutation.mutateAsync(item.id);
			toast.success("Siswa dipulihkan ke kelas");
			setNotice({ kind: "success", message: "Siswa dipulihkan ke kelas" });
		} catch (err) {
			const errText = errorMessage(err);
			toast.error(errText);
			setNotice({ kind: "error", message: errText });
		}
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* 3.2 Header Halaman */}
				<ClassStudentsHeader onOpenCreate={() => setIsAdding(true)} />

				{/* Notifikasi feedback */}
				{notice && (
					<div
						role="status"
						className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium shadow-sm ${
							notice.kind === "success"
								? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
								: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
						}`}
					>
						<span>{notice.message}</span>
						<button
							type="button"
							onClick={() => setNotice(null)}
							className="text-xs font-semibold hover:underline"
						>
							Tutup
						</button>
					</div>
				)}

				{/* 3.3 Empat Kartu Informasi */}
				<ClassStudentsStats
					summary={summaryQuery.data}
					selectedClassName={selectedClassName}
					isLoading={summaryQuery.isPending}
					isError={summaryQuery.isError}
				/>

				{/* Panel Tabel & Filter */}
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
					{/* 3.4 Baris Filter di bagian atas panel tabel */}
					<ClassStudentsFilter
						searchTerm={search}
						onSearchChange={handleSearchChange}
						selectedClassId={selectedClassId}
						onClassChange={handleClassChange}
						selectedStatus={selectedStatus}
						onStatusChange={handleStatusChange}
						classes={classesList}
						isLoadingClasses={classesQuery.isPending}
					/>

					{/* 3.7 & 3.8 Tabel dan Footer Paginasi */}
					<ClassStudentsTable
						rows={rows}
						meta={meta}
						status={selectedStatus}
						isLoading={listQuery.isPending}
						isError={listQuery.isError}
						searchTerm={debouncedSearch.trim()}
						hasFilterActive={Boolean(selectedClassId)}
						selectedIds={selectedIds}
						onToggleSelectRow={handleToggleSelectRow}
						onToggleSelectAll={handleToggleSelectAll}
						onPageChange={(page) => setCurrentPage(page)}
						onLimitChange={handleLimitChange}
						onRetry={() => listQuery.refetch()}
						onRemoveSingle={(item) => setRemovingItem(item)}
						onRemoveBulk={() => setIsBulkRemoving(true)}
						onRestore={handleRestore}
						isRestoring={restoreMutation.isPending}
					/>
				</div>
			</div>

			{/* 3.9 Modal Tambah Siswa ke Kelas */}
			<ClassStudentDialog
				open={isAdding}
				defaultClassId={selectedClassId}
				classes={classesList}
				isSaving={batchCreateMutation.isPending}
				onClose={() => setIsAdding(false)}
				onSave={handleCreate}
			/>

			{/* 3.10 Dialog Konfirmasi Keluarkan Siswa (Single / Bulk) */}
			<RemoveClassStudentDialog
				open={Boolean(removingItem) || isBulkRemoving}
				item={removingItem}
				bulkCount={isBulkRemoving ? selectedIds.size : 0}
				isRemoving={deleteMutation.isPending || batchDeleteMutation.isPending}
				onClose={() => {
					setRemovingItem(null);
					setIsBulkRemoving(false);
				}}
				onConfirm={handleConfirmRemove}
			/>
		</main>
	);
}
