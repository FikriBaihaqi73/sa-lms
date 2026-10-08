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
  const teachersQuery = useTeachers({
    page: state.page,
    limit: state.limit,
    search: state.deferredSearch.trim(),
    status: state.statusId,
    specialization: state.specializationId,
  });
  const statsQuery = useTeacherStats();
  const profilesQuery = useTeacherProfiles();
  const statusesQuery = useEmploymentStatuses();
  const specializationsQuery = useSpecializations();
  const assignmentsQuery = useTeacherClassSubjects(state.editingTeacher?.id);
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();

  const teachers = teachersQuery.data?.data ?? [];
  const meta = teachersQuery.data?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  async function handleCreate(values: TeacherFormValues) {
    try {
      await createMutation.mutateAsync(toCreateInput(values));
      state.setIsAdding(false);
      state.setNotice({ kind: "success", message: "Guru berhasil ditambahkan." });
    } catch (error) {
      state.setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  async function handleUpdate(values: TeacherFormValues) {
    if (!state.editingTeacher) return;
    try {
      await updateMutation.mutateAsync({ id: state.editingTeacher.id, input: toUpdateInput(values) });
      state.setEditingTeacher(null);
      state.setNotice({ kind: "success", message: "Perubahan guru berhasil disimpan." });
    } catch (error) {
      state.setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  async function handleDelete() {
    if (!state.deletingTeacher) return;
    try {
      await deleteMutation.mutateAsync(state.deletingTeacher.id);
      state.setDeletingTeacher(null);
      state.setNotice({ kind: "success", message: "Guru berhasil dihapus." });
    } catch (error) {
      state.setNotice({ kind: "error", message: errorMessage(error) });
    }
  }
  return { state, teachersQuery, statsQuery, profilesQuery, statusesQuery, specializationsQuery, assignmentsQuery, createMutation, updateMutation, deleteMutation, teachers, meta, totalPages, handleCreate, handleUpdate, handleDelete };
}

export type TeachersPageController = ReturnType<typeof useTeachersPageController>;


export function TeachersPageLayout({ controller }: { controller: TeachersPageController }) {
  const { state, teachersQuery, statsQuery, profilesQuery, statusesQuery } = controller;
  const { specializationsQuery, assignmentsQuery, createMutation, updateMutation } = controller;
  const { deleteMutation, teachers, meta, handleCreate, handleUpdate, handleDelete } = controller;
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {state.notice && <div role="status">{state.notice.message}</div>}
        <TeachersHeader onOpenCreate={() => state.setIsAdding(true)} />
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
          onAdd={() => state.setIsAdding(true)}
          onEdit={state.setEditingTeacher}
          onDelete={state.setDeletingTeacher}
        />
      </div>
      {state.isAdding && (
        <AddTeacherDialog
          open={state.isAdding}
          profiles={profilesQuery.data ?? []}
          statuses={statusesQuery.data ?? []}
          specializations={specializationsQuery.data ?? []}
          isSaving={createMutation.isPending}
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
