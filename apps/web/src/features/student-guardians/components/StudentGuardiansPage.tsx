import { useDeferredValue, useEffect, useState } from "react";
import { DeleteStudentGuardianDialog } from "./DeleteStudentGuardianDialog";
import { StudentGuardianDetailDialog } from "./StudentGuardianDetailDialog";
import { StudentGuardianFormDialog } from "./StudentGuardianFormDialog";
import { StudentGuardiansHeader } from "./StudentGuardiansHeader";
import { StudentGuardiansTable } from "./StudentGuardiansTable";
import {
  useCreateStudentGuardian,
  useDeleteStudentGuardian,
  useStudentGuardian,
  useStudentGuardians,
  useUpdateStudentGuardian,
} from "../hooks/useStudentGuardians";
import type { StudentGuardian } from "../types";
import type { StudentGuardianFormValues } from "../schemas/studentGuardianSchema";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

export function StudentGuardiansPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState<StudentGuardian | null>(null);
  const [deleting, setDeleting] = useState<StudentGuardian | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(
    null,
  );

  const listQuery = useStudentGuardians({ page, limit, search: deferredSearch.trim() });
  const detailQuery = useStudentGuardian(detailId);
  const createMutation = useCreateStudentGuardian();
  const updateMutation = useUpdateStudentGuardian();
  const deleteMutation = useDeleteStudentGuardian();

  const result = listQuery.data;
  const records = result?.data ?? [];
  const meta = result?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function handleSave(values: StudentGuardianFormValues) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: values });
        setNotice({ kind: "success", message: "Relasi siswa dan wali berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync(values);
        setNotice({ kind: "success", message: "Relasi siswa dan wali berhasil ditambahkan." });
      }
      setIsDialogOpen(false);
      setEditing(null);
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setNotice({ kind: "success", message: "Relasi siswa dan wali berhasil dihapus." });
      setDeleting(null);
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  }
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {notice && (
          <div
            role="status"
            className={`rounded-lg border p-4 text-sm font-medium shadow-sm ${
              notice.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {notice.message}
          </div>
        )}
        <StudentGuardiansHeader
          searchTerm={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onOpenCreate={() => {
            setEditing(null);
            setIsDialogOpen(true);
          }}
        />
        <StudentGuardiansTable
          records={records}
          isLoading={listQuery.isPending}
          isError={listQuery.isError}
          searchTerm={deferredSearch.trim()}
          total={meta?.total ?? 0}
          onDetail={(record) => setDetailId(record.id)}
          onEdit={(record) => {
            setEditing(record);
            setIsDialogOpen(true);
          }}
          onDelete={setDeleting}
        />
        {!listQuery.isPending && !listQuery.isError && meta && meta.totalPages > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
            <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              Per halaman
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Halaman {meta.page} dari {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
      <StudentGuardianFormDialog
        open={isDialogOpen}
        record={editing}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
      <StudentGuardianDetailDialog
        open={detailId !== null}
        record={detailQuery.data}
        isLoading={detailQuery.isPending}
        isError={detailQuery.isError}
        onClose={() => setDetailId(null)}
      />
      <DeleteStudentGuardianDialog
        record={deleting}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
