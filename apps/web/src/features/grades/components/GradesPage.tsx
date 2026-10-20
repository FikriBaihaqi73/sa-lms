import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { GradesHeader } from "./GradesHeader";
import { GradesStats } from "./GradesStats";
import { GradesScaleVisual } from "./GradesScaleVisual";
import { GradesTable } from "./GradesTable";
import { GradeDialog } from "./GradeDialog";
import { DeleteGradeDialog } from "./DeleteGradeDialog";
import {
  useCreateGrade,
  useDeleteGrade,
  useGrades,
  useUpdateGrade,
} from "../hooks/useGrades";
import type { GradeFormValues } from "../schemas/gradeSchema";
import type { StandardGrade } from "../types";

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

export function GradesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<StandardGrade | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<StandardGrade | null>(null);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const gradesQuery = useGrades();
  const createMutation = useCreateGrade();
  const updateMutation = useUpdateGrade();
  const deleteMutation = useDeleteGrade();

  const grades = gradesQuery.data ?? [];

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleCreate = async (values: GradeFormValues) => {
    try {
      await createMutation.mutateAsync({
        grade: values.grade,
        minimumScore: values.minimumScore,
        maximumScore: values.maximumScore,
        description: values.description ?? undefined,
      });
      setIsAddOpen(false);
      setNotice({
        kind: "success",
        message: `Standar penilaian "${values.grade}" berhasil ditambahkan.`,
      });
    } catch (err) {
      setNotice({
        kind: "error",
        message: formatErrorMessage(err),
      });
    }
  };

  const handleUpdate = async (values: GradeFormValues) => {
    if (!editingGrade) return;
    try {
      await updateMutation.mutateAsync({
        id: editingGrade.id,
        input: {
          grade: values.grade,
          minimumScore: values.minimumScore,
          maximumScore: values.maximumScore,
          description: values.description ?? undefined,
        },
      });
      setEditingGrade(null);
      setNotice({
        kind: "success",
        message: `Standar penilaian "${values.grade}" berhasil diperbarui.`,
      });
    } catch (err) {
      setNotice({
        kind: "error",
        message: formatErrorMessage(err),
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingGrade) return;
    try {
      await deleteMutation.mutateAsync(deletingGrade.id);
      setNotice({
        kind: "success",
        message: `Standar penilaian "${deletingGrade.grade}" berhasil dihapus.`,
      });
      setDeletingGrade(null);
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
        <GradesHeader onAdd={() => setIsAddOpen(true)} />

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
        {gradesQuery.isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            {formatErrorMessage(gradesQuery.error)}
          </div>
        )}

        {/* Summary Stats */}
        <GradesStats grades={grades} isLoading={gradesQuery.isPending} />

        {/* Interactive Visual Scale Preview */}
        {!gradesQuery.isPending && grades.length > 0 && (
          <GradesScaleVisual grades={grades} />
        )}

        {/* Main Table */}
        <GradesTable
          grades={grades}
          isLoading={gradesQuery.isPending}
          onEdit={(item) => setEditingGrade(item)}
          onDelete={(item) => setDeletingGrade(item)}
          onAdd={() => setIsAddOpen(true)}
        />
      </div>

      {/* Add Dialog */}
      {isAddOpen && (
        <GradeDialog
          open={isAddOpen}
          isSaving={createMutation.isPending}
          onClose={() => setIsAddOpen(false)}
          onSave={handleCreate}
        />
      )}

      {/* Edit Dialog */}
      {editingGrade && (
        <GradeDialog
          open={Boolean(editingGrade)}
          grade={editingGrade}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingGrade(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Dialog */}
      {deletingGrade && (
        <DeleteGradeDialog
          grade={deletingGrade}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeletingGrade(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
