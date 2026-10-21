import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import { DepartmentsHeader } from "./DepartmentsHeader";
import { DepartmentsStats } from "./DepartmentsStats";
import { DepartmentsTable } from "./DepartmentsTable";
import { DepartmentDialog } from "./DepartmentDialog";
import { DeleteDepartmentDialog } from "./DeleteDepartmentDialog";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "../hooks/useDepartments";
import type { DepartmentFormValues } from "../schemas/departmentSchema";
import type { Department } from "../types";

function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.fieldErrors && error.fieldErrors.length > 0) {
      const details = error.fieldErrors
        .map((f) => `${f.field}: ${f.message}`)
        .join("; ");
      return `${error.message} (${details})`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan pada sistem. Silakan coba kembali.";
}

export function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);

  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const departmentsQuery = useDepartments({
    page: currentPage,
    limit,
    search: debouncedSearch.trim() || undefined,
  });

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const departments = departmentsQuery.data?.data ?? [];
  const meta = departmentsQuery.data?.meta;

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleCreate = async (values: DepartmentFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        code: values.code,
        teacher_ids: values.teacher_ids,
      });
      setIsAddOpen(false);
      setNotice({
        kind: "success",
        message: `Departemen "${values.name}" (${values.code}) berhasil ditambahkan.`,
      });
    } catch (err) {
      setNotice({
        kind: "error",
        message: formatErrorMessage(err),
      });
    }
  };

  const handleUpdate = async (values: DepartmentFormValues) => {
    if (!editingDepartment) return;
    try {
      await updateMutation.mutateAsync({
        id: editingDepartment.id,
        input: {
          name: values.name,
          code: values.code,
          teacher_ids: values.teacher_ids,
        },
      });
      setEditingDepartment(null);
      setNotice({
        kind: "success",
        message: `Departemen "${values.name}" (${values.code}) berhasil diperbarui.`,
      });
    } catch (err) {
      setNotice({
        kind: "error",
        message: formatErrorMessage(err),
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingDepartment) return;
    try {
      await deleteMutation.mutateAsync(deletingDepartment.id);
      setNotice({
        kind: "success",
        message: `Departemen "${deletingDepartment.name}" berhasil dihapus.`,
      });
      setDeletingDepartment(null);
      if (departments.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      setNotice({
        kind: "error",
        message: formatErrorMessage(err),
      });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <DepartmentsHeader onAdd={() => setIsAddOpen(true)} />

        {/* Notice Alert */}
        {notice && (
          <div
            role="status"
            className={`flex items-center justify-between rounded-xl border p-4 text-sm font-medium shadow-sm transition-all ${
              notice.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-semibold hover:underline ml-4"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Global Query Error */}
        {departmentsQuery.isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            {formatErrorMessage(departmentsQuery.error)}
          </div>
        )}

        {/* Summary Stats */}
        <DepartmentsStats
          departments={departments}
          totalData={meta?.totalData ?? departments.length}
          isLoading={departmentsQuery.isPending}
        />

        {/* Main Table */}
        <DepartmentsTable
          departments={departments}
          meta={meta}
          isLoading={departmentsQuery.isPending}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          onEdit={(dept) => setEditingDepartment(dept)}
          onDelete={(dept) => setDeletingDepartment(dept)}
          onAdd={() => setIsAddOpen(true)}
        />
      </div>

      {/* Add Dialog */}
      {isAddOpen && (
        <DepartmentDialog
          open={isAddOpen}
          isSaving={createMutation.isPending}
          onClose={() => setIsAddOpen(false)}
          onSave={handleCreate}
        />
      )}

      {/* Edit Dialog */}
      {editingDepartment && (
        <DepartmentDialog
          open={Boolean(editingDepartment)}
          department={editingDepartment}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingDepartment(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Dialog */}
      {deletingDepartment && (
        <DeleteDepartmentDialog
          department={deletingDepartment}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeletingDepartment(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
