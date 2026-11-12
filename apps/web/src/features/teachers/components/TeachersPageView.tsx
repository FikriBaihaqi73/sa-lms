import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TeachersHeader } from "./TeachersHeader";
import { TeacherStatsCards } from "./TeacherStatsCards";
import { TeacherFilterBar } from "./TeacherFilterBar";
import { TeachersTable } from "./TeachersTableBody";
import { AddTeacherDialog } from "./AddTeacherDialog";
import { DeleteTeacherDialog } from "./DeleteTeacherDialog";
import { EditTeacherSheet } from "./EditTeacherSheet";
import {
  useCreateTeacher,
  useDeleteTeacher,
  useEmploymentStatuses,
  useSpecializations,
  useTeacherClassSubjects,
  useTeacherDepartments,
  useTeacherProfiles,
  useTeachers,
  useTeacherStats,
  useUpdateTeacher,
} from "../hooks/useTeachers";
import { toCreateInput, toUpdateInput, useTeachersPageState } from "./TeachersPage";
import type { TeacherFormValues } from "../schemas/teacherSchema";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}


export function useTeachersPageController() {
  const state = useTeachersPageState();
  const [dialogError, setDialogError] = useState<string | null>(null);
  const teachersQuery = useTeachers({
    page: state.page,
    limit: state.limit,
    search: state.debouncedSearch.trim(),
    status: state.statusId,
    specialization: state.specializationId,
  });
  const statsQuery = useTeacherStats();
  const statusesQuery = useEmploymentStatuses();
  const specializationsQuery = useSpecializations();
  const departmentsQuery = useTeacherDepartments();
  const profilesQuery = useTeacherProfiles();
  const assignmentsQuery = useTeacherClassSubjects(state.editingTeacher?.id);
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();

  const teachers = teachersQuery.data?.data ?? [];
  const meta = teachersQuery.data?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  const { notice, setNotice } = state;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice, setNotice]);

  async function handleCreate(values: TeacherFormValues) {
    try {
      setDialogError(null);
      await createMutation.mutateAsync(toCreateInput(values));
      state.setIsAdding(false);
      state.setNotice({ kind: "success", message: "Guru berhasil ditambahkan." });
      toast.success("Guru berhasil ditambahkan.");
      await Promise.all([
        teachersQuery.refetch(),
        statsQuery.refetch(),
        profilesQuery.refetch(),
      ]);
    } catch (error) {
      const msg = errorMessage(error);
      setDialogError(msg);
      state.setNotice({ kind: "error", message: msg });
      toast.error(msg);
    }
  }

  async function handleUpdate(values: TeacherFormValues) {
    if (!state.editingTeacher) return;
    try {
      await updateMutation.mutateAsync({ id: state.editingTeacher.id, input: toUpdateInput(values) });
      state.setEditingTeacher(null);
      state.setNotice({ kind: "success", message: "Perubahan guru berhasil disimpan." });
      toast.success("Perubahan guru berhasil disimpan.");
      await Promise.all([
        teachersQuery.refetch(),
        statsQuery.refetch(),
        profilesQuery.refetch(),
      ]);
    } catch (error) {
      const msg = errorMessage(error);
      state.setNotice({ kind: "error", message: msg });
      toast.error(msg);
    }
  }

  async function handleDelete() {
    if (!state.deletingTeacher) return;
    try {
      await deleteMutation.mutateAsync(state.deletingTeacher.id);
      state.setDeletingTeacher(null);
      state.setNotice({ kind: "success", message: "Guru berhasil dihapus." });
      toast.success("Guru berhasil dihapus.");
      await Promise.all([
        teachersQuery.refetch(),
        statsQuery.refetch(),
        profilesQuery.refetch(),
      ]);
    } catch (error) {
      const msg = errorMessage(error);
      state.setNotice({ kind: "error", message: msg });
      toast.error(msg);
    }
  }

  const openCreateDialog = () => {
    setDialogError(null);
    state.setIsAdding(true);
  };

  return { state, dialogError, setDialogError, openCreateDialog, teachersQuery, statsQuery, statusesQuery, specializationsQuery, departmentsQuery, profilesQuery, assignmentsQuery, createMutation, updateMutation, deleteMutation, teachers, meta, totalPages, handleCreate, handleUpdate, handleDelete };
}

export type TeachersPageController = ReturnType<typeof useTeachersPageController>;


export function TeachersPageLayout({ controller }: { controller: TeachersPageController }) {
  const { state, dialogError, openCreateDialog, teachersQuery, statsQuery, statusesQuery } = controller;
  const { specializationsQuery, departmentsQuery, profilesQuery, assignmentsQuery, createMutation, updateMutation } = controller;
  const { deleteMutation, teachers, meta, handleCreate, handleUpdate, handleDelete } = controller;
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {state.notice && (
          <div
            role="status"
            className={`rounded-lg border p-4 text-sm font-medium shadow-sm ${state.notice.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              }`}
          >
            {state.notice.message}
          </div>
        )}
        <TeachersHeader onOpenCreate={openCreateDialog} />
        <TeacherStatsCards stats={statsQuery.data} isLoading={statsQuery.isPending} isError={statsQuery.isError} />
        <TeacherFilterBar
          search={state.search}
          statusId={state.statusId}
          specializationId={state.specializationId}
          statuses={statusesQuery.data ?? []}
          specializations={specializationsQuery.data ?? []}
          onSearchChange={(value) => { state.setSearch(value); state.setPage(1); }}
          onStatusChange={(value) => { state.setStatusId(value); state.setPage(1); }}
          onSpecializationChange={(value) => { state.setSpecializationId(value); state.setPage(1); }}
        />
        <TeachersTable
          teachers={teachers}
          isLoading={teachersQuery.isPending}
          isError={teachersQuery.isError}
          page={meta?.page ?? state.page}
          limit={meta?.limit ?? state.limit}
          total={meta?.total ?? 0}
          onAdd={openCreateDialog}
          onEdit={state.setEditingTeacher}
          onDelete={state.setDeletingTeacher}
        />
      </div>
      {state.isAdding && (
        <AddTeacherDialog
          open={state.isAdding}
          statuses={statusesQuery.data ?? []}
          specializations={specializationsQuery.data ?? []}
          departments={departmentsQuery.data ?? []}
          profiles={profilesQuery.data ?? []}
          isSaving={createMutation.isPending}
          serverError={dialogError}
          onClose={() => state.setIsAdding(false)}
          onSave={handleCreate}
        />
      )}
      {state.editingTeacher && (
        <EditTeacherSheet
          open={Boolean(state.editingTeacher)}
          teacher={state.editingTeacher}
          assignments={assignmentsQuery.data ?? []}
          assignmentsLoading={assignmentsQuery.isPending}
          isSaving={updateMutation.isPending}
          onClose={() => state.setEditingTeacher(null)}
          onSave={handleUpdate}
        />
      )}
      <DeleteTeacherDialog
        teacher={state.deletingTeacher}
        isDeleting={deleteMutation.isPending}
        onClose={() => state.setDeletingTeacher(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}

export function TeachersPage() {
  const controller = useTeachersPageController();
  return <TeachersPageLayout controller={controller} />;
}
