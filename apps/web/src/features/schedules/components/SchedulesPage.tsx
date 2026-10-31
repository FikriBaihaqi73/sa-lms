import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCreateSchedule,
  useDeleteSchedule,
  useScheduleOptions,
  useSchedules,
  useUpdateSchedule,
} from "../hooks/useSchedules";
import type { Schedule } from "../types";
import type { ScheduleFormValues } from "../schemas/scheduleSchema";
import { SchedulesHeader } from "./SchedulesHeader";
import { SchedulesStats } from "./SchedulesStats";
import { SchedulesFilterBar } from "./SchedulesFilterBar";
import { SchedulesTable } from "./SchedulesTable";
import { ScheduleDialog } from "./ScheduleDialog";
import { DeleteScheduleDialog } from "./DeleteScheduleDialog";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan pada sistem. Silakan coba lagi.";
}

export function SchedulesPage() {
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);

  // Debounced search for API query
  const debouncedSearch = useDebounce(search, 300);

  // Data fetching
  const schedulesQuery = useSchedules({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    day: selectedDay !== "all" ? selectedDay : undefined,
    classroomId: selectedClassroomId || undefined,
  });

  const optionsQuery = useScheduleOptions();

  // Mutations
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const schedules = useMemo(
    () => schedulesQuery.data?.data ?? [],
    [schedulesQuery.data?.data],
  );

  const meta = schedulesQuery.data?.meta ?? {
    totalData: 0,
    totalPages: 0,
    currentPage: page,
    perPage: limit,
  };

  // Handlers for dialogs
  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
  };

  const handleSave = async (values: ScheduleFormValues) => {
    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({
          id: editingSchedule.id,
          input: values,
        });
        toast.success("Jadwal pelajaran berhasil diperbarui.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Jadwal pelajaran berhasil ditambahkan.");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSchedule) return;

    try {
      await deleteMutation.mutateAsync(deletingSchedule.id);
      toast.success("Jadwal pelajaran berhasil dihapus.");
      setDeletingSchedule(null);

      // Adjust page if last item on current page was deleted
      if (schedules.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDay("all");
    setSelectedClassroomId("");
    setPage(1);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0f172a] dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <SchedulesHeader onOpenCreate={handleOpenCreate} />

        {/* Stats Summary */}
        <SchedulesStats
          schedules={schedules}
          totalData={meta.totalData}
          isLoading={schedulesQuery.isLoading}
        />

        {/* Filters */}
        <SchedulesFilterBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectedDay={selectedDay}
          onDayChange={(val) => {
            setSelectedDay(val);
            setPage(1);
          }}
          selectedClassroomId={selectedClassroomId}
          onClassroomChange={(val) => {
            setSelectedClassroomId(val);
            setPage(1);
          }}
          classrooms={optionsQuery.data?.classrooms ?? []}
          onReset={handleResetFilters}
        />

        {/* Table List */}
        <SchedulesTable
          schedules={schedules}
          isLoading={schedulesQuery.isLoading}
          isError={schedulesQuery.isError}
          meta={meta}
          limit={limit}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onPageChange={setPage}
          onOpenCreate={handleOpenCreate}
          onEdit={handleOpenEdit}
          onDelete={setDeletingSchedule}
          onRetry={() => void schedulesQuery.refetch()}
        />
      </div>

      {/* Modal Dialogs */}
      <ScheduleDialog
        open={isDialogOpen}
        item={editingSchedule}
        options={optionsQuery.data}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />

      <DeleteScheduleDialog
        item={deletingSchedule}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={handleDeleteConfirm}
      />
    </main>
  );
}
export default SchedulesPage;
