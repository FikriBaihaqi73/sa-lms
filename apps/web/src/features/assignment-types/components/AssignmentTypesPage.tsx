import { useMemo, useState } from "react";
import { AssignmentTypeHeader } from "./AssignmentTypeHeader";
import { AssignmentTypeStats } from "./AssignmentTypeStats";
import { AssignmentTypesTable } from "./AssignmentTypesTable";
import { AssignmentTypeDialog } from "./AssignmentTypeDialog";
import { DeleteAssignmentTypeDialog } from "./DeleteAssignmentTypeDialog";
import {
  useAssignmentTypes,
  useCreateAssignmentType,
  useDeleteAssignmentType,
  useUpdateAssignmentType,
} from "../hooks/useAssignmentTypes";
import type { AssignmentType } from "../types";
import type { AssignmentTypeFormValues } from "../schemas";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export function AssignmentTypesPage() {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<AssignmentType | null>(null);
  const [deletingItem, setDeletingItem] = useState<AssignmentType | null>(null);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const typesQuery = useAssignmentTypes();
  const createMutation = useCreateAssignmentType();
  const updateMutation = useUpdateAssignmentType();
  const deleteMutation = useDeleteAssignmentType();

  const types = useMemo(() => typesQuery.data ?? [], [typesQuery.data]);

  const handleCreate = async (values: AssignmentTypeFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });
      setIsAdding(false);
      setNotice({
        kind: "success",
        message: "Tipe tugas berhasil ditambahkan.",
      });
    } catch (err) {
      setNotice({ kind: "error", message: errorMessage(err) });
    }
  };

  const handleUpdate = async (values: AssignmentTypeFormValues) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        input: {
          name: values.name,
          description: values.description || undefined,
        },
      });
      setEditingItem(null);
      setNotice({
        kind: "success",
        message: "Tipe tugas berhasil diperbarui.",
      });
    } catch (err) {
      setNotice({ kind: "error", message: errorMessage(err) });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
      setNotice({
        kind: "success",
        message: "Tipe tugas berhasil dihapus.",
      });
    } catch (err) {
      setNotice({ kind: "error", message: errorMessage(err) });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 text-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <AssignmentTypeHeader onAdd={() => setIsAdding(true)} />

        {notice && (
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium shadow-sm transition-all ${
              notice.kind === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
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

        {typesQuery.isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {errorMessage(typesQuery.error)}
          </div>
        )}

        <AssignmentTypeStats types={types} isLoading={typesQuery.isPending} />

        <AssignmentTypesTable
          types={types}
          isLoading={typesQuery.isPending}
          search={search}
          onSearchChange={setSearch}
          onEdit={(item) => setEditingItem(item)}
          onDelete={(item) => setDeletingItem(item)}
        />
      </div>

      {isAdding && (
        <AssignmentTypeDialog
          open={isAdding}
          isSaving={createMutation.isPending}
          onClose={() => setIsAdding(false)}
          onSave={handleCreate}
        />
      )}

      {editingItem && (
        <AssignmentTypeDialog
          open={Boolean(editingItem)}
          assignmentType={editingItem}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdate}
        />
      )}

      {deletingItem && (
        <DeleteAssignmentTypeDialog
          assignmentType={deletingItem}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
