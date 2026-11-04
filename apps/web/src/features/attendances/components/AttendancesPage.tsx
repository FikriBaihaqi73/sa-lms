import React, { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { AttendanceHeader } from "./AttendanceHeader";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceFilterBar } from "./AttendanceFilterBar";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceDialog } from "./AttendanceDialog";
import { DeleteAttendanceDialog } from "./DeleteAttendanceDialog";
import {
  useAttendances,
  useAttendanceSummary,
  useCreateAttendance,
  useDeleteAttendance,
  useUpdateAttendance,
} from "../hooks/useAttendances";
import type { Attendance, CreateAttendanceInput } from "../types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.";
}

export const AttendancesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);

  const [date, setDate] = useState("");
  const [classId, setClassId] = useState("");
  const [statusId, setStatusId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null,
  );
  const [deletingAttendance, setDeletingAttendance] =
    useState<Attendance | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  // Queries
  const normalizedSearch = debouncedSearch.trim();
  const attendancesQuery = useAttendances({
    page: currentPage,
    limit,
    search: normalizedSearch || undefined,
    class_id: classId || undefined,
    attendance_status_id: statusId || undefined,
    attendance_date: date || undefined,
  });

  const summaryQuery = useAttendanceSummary({
    class_id: classId || undefined,
    search: normalizedSearch || undefined,
    attendance_date: date || undefined,
  });

  // Mutations
  const createMutation = useCreateAttendance();
  const updateMutation = useUpdateAttendance();
  const deleteMutation = useDeleteAttendance();

  const attendances = attendancesQuery.data?.data ?? [];
  const meta = attendancesQuery.data?.meta;
  const summary = summaryQuery.data;

  // Auto-dismiss notice
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const handleFormSubmit = async (values: CreateAttendanceInput) => {
    try {
      if (editingAttendance) {
        await updateMutation.mutateAsync({
          id: editingAttendance.id,
          input: values,
        });
        setNotice({
          kind: "success",
          message: "Data presensi berhasil diperbarui.",
        });
      } else {
        await createMutation.mutateAsync(values);
        setNotice({
          kind: "success",
          message: "Data presensi berhasil dicatat.",
        });
      }
      setIsFormModalOpen(false);
      setEditingAttendance(null);
    } catch (err) {
      setNotice({
        kind: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAttendance) return;
    try {
      await deleteMutation.mutateAsync(deletingAttendance.id);
      setNotice({
        kind: "success",
        message: "Data presensi berhasil dihapus.",
      });
      setIsDeleteDialogOpen(false);
      setDeletingAttendance(null);
    } catch (err) {
      setNotice({
        kind: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const openCreate = () => {
    setEditingAttendance(null);
    setIsFormModalOpen(true);
  };

  const openEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setIsFormModalOpen(true);
  };

  const openDelete = (attendance: Attendance) => {
    setDeletingAttendance(attendance);
    setIsDeleteDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDate("");
    setClassId("");
    setStatusId("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setCurrentPage(1);
  };

  const handleClassIdChange = (value: string) => {
    setClassId(value);
    setCurrentPage(1);
  };

  const handleStatusIdChange = (value: string) => {
    setStatusId(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50/50 p-4 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Floating toast notification */}
        {notice && (
          <div
            role="status"
            className={`fixed right-4 top-4 z-[60] rounded-xl border p-4 text-sm font-medium shadow-lg transition-all ${
              notice.kind === "success"
                ? "border-emerald-500 bg-emerald-600 text-white"
                : "border-red-500 bg-red-600 text-white"
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Header */}
        <AttendanceHeader onOpenCreateModal={openCreate} />

        {/* Stats summary */}
        <AttendanceStats
          summary={summary}
          isLoading={summaryQuery.isLoading}
        />

        {/* Filter bar */}
        <AttendanceFilterBar
          search={searchTerm}
          onSearchChange={handleSearchChange}
          date={date}
          onDateChange={handleDateChange}
          classId={classId}
          onClassIdChange={handleClassIdChange}
          statusId={statusId}
          onStatusIdChange={handleStatusIdChange}
          onReset={handleResetFilters}
        />

        {/* Table */}
        <AttendanceTable
          attendances={attendances}
          isLoading={attendancesQuery.isLoading}
          isError={attendancesQuery.isError}
          error={attendancesQuery.error}
          onRetry={() => attendancesQuery.refetch()}
          onEdit={openEdit}
          onDelete={openDelete}
          meta={meta}
          onPageChange={handlePageChange}
          limit={limit}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Form Modal */}
      <AttendanceDialog
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAttendance(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAttendance}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAttendanceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingAttendance(null);
        }}
        onConfirm={handleConfirmDelete}
        attendance={deletingAttendance}
        isDeleting={deleteMutation.isPending}
      />
    </main>
  );
};
