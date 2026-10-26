import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import { useClasses, useCreateClass, useDeleteClass, useUpdateClass } from "../hooks/useClasses";
import type { ClassFormValues } from "../schemas/classSchema";
import type { ClassItem } from "../types";
import { ClassDialog } from "./ClassDialog";
import { ClassesHeader } from "./ClassesHeader";
import { ClassesStats } from "./ClassesStats";
import { ClassesTable } from "./ClassesTable";
import { DeleteClassDialog } from "./DeleteClassDialog";

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.fieldErrors.length > 0) {
      return `${error.message}: ${error.fieldErrors.map(({ field, message }) => `${field || "field"} - ${message}`).join("; ")}`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export function ClassesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [deleting, setDeleting] = useState<ClassItem | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const listQuery = useClasses({ page: currentPage, limit, search: debouncedSearch.trim() });
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta ?? null;

  const handleCreate = async (values: ClassFormValues) => {
    try {
      await createMutation.mutateAsync({
        academic_year_id: values.academic_year_id,
        name: values.name.trim(),
        grade_level: values.grade_level,
        ...(values.homeroom_teacher_id
          ? { homeroom_teacher_id: values.homeroom_teacher_id }
          : {}),
      });
      setIsAdding(false);
      setCurrentPage(1);
      setNotice({ kind: "success", message: "Kelas berhasil ditambahkan." });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  };

  const handleUpdate = async (values: ClassFormValues) => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        input: {
          academic_year_id: values.academic_year_id,
          name: values.name.trim(),
          grade_level: values.grade_level,
          homeroom_teacher_id: values.homeroom_teacher_id ?? null,
        },
      });
      setEditing(null);
      setNotice({ kind: "success", message: "Kelas berhasil diperbarui." });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
      setNotice({ kind: "success", message: "Kelas berhasil dihapus." });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0f172a] dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ClassesHeader searchTerm={search} onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }} onOpenCreate={() => setIsAdding(true)} />
        {notice && (
          <div className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium shadow-sm ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"}`}>
            <span>{notice.message}</span>
            <button type="button" onClick={() => setNotice(null)} className="text-xs font-semibold hover:underline">Tutup</button>
          </div>
        )}
        <ClassesStats total={meta?.total} visibleCount={rows.length} page={meta?.page} totalPages={meta?.totalPages} isLoading={listQuery.isPending} />
        <ClassesTable
          rows={rows}
          isLoading={listQuery.isPending}
          isError={listQuery.isError}
          searchTerm={debouncedSearch.trim()}
          total={meta?.total ?? 0}
          onRetry={() => listQuery.refetch()}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
        {!listQuery.isPending && !listQuery.isError && meta && meta.totalPages > 0 && <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"><label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">Per halaman<select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label><div className="flex items-center gap-3"><button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Sebelumnya</button><span className="text-sm text-slate-600 dark:text-slate-400">Halaman {meta.page} dari {Math.max(meta.totalPages, 1)}</span><button type="button" onClick={() => setCurrentPage((page) => Math.min(meta.totalPages, page + 1))} disabled={currentPage >= meta.totalPages} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Berikutnya</button></div></div>}
      </div>
      <ClassDialog open={isAdding} isSaving={createMutation.isPending} onClose={() => setIsAdding(false)} onSave={handleCreate} />
      <ClassDialog open={Boolean(editing)} cls={editing} isSaving={updateMutation.isPending} onClose={() => setEditing(null)} onSave={handleUpdate} />
      <DeleteClassDialog classItem={deleting} isDeleting={deleteMutation.isPending} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </main>
  );
}
