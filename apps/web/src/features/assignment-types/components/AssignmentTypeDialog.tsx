import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { useEffect } from "react";
import {
  assignmentTypeFormSchema,
  type AssignmentTypeFormValues,
} from "../schemas";
import type { AssignmentType } from "../types";

interface AssignmentTypeDialogProps {
  open: boolean;
  assignmentType?: AssignmentType | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: AssignmentTypeFormValues) => Promise<void>;
}

export function AssignmentTypeDialog({
  open,
  assignmentType,
  isSaving,
  onClose,
  onSave,
}: AssignmentTypeDialogProps) {
  const isEdit = Boolean(assignmentType);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentTypeFormValues>({
    resolver: zodResolver(assignmentTypeFormSchema),
    defaultValues: {
      name: assignmentType?.name || "",
      description: assignmentType?.description || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: assignmentType?.name || "",
        description: assignmentType?.description || "",
      });
    }
  }, [open, assignmentType, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isEdit ? "Edit Tipe Tugas" : "Tambah Tipe Tugas Baru"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit
                ? "Perbarui informasi kategori atau tipe penugasan"
                : "Masukkan data untuk tipe tugas baru"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Nama Tipe Tugas <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              placeholder="Contoh: Tugas Individu, Proyek, Kuis"
              className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Deskripsi (Opsional)
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              placeholder="Jelaskan tujuan atau petunjuk dari tipe tugas ini..."
              className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                errors.description
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan Tipe Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
