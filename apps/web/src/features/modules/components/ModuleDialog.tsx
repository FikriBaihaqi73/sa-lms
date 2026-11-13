import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  type ModuleFormValues,
  moduleFormSchema,
} from "../schemas/moduleSchema";
import type { ClassSubjectOption, LearningModule } from "../types";

interface ModuleDialogProps {
  open: boolean;
  module?: LearningModule | null;
  classSubjectOptions: ClassSubjectOption[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: ModuleFormValues) => Promise<void>;
}

export const ModuleDialog: React.FC<ModuleDialogProps> = ({
  open,
  module,
  classSubjectOptions,
  isSaving,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(module);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: "",
      class_subject_id: "",
      description: "",
      display_order: null,
      is_published: false,
      is_locked: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (module) {
        reset({
          title: module.title,
          class_subject_id: module.class_subject_id,
          description: module.description ?? "",
          display_order: module.display_order ?? null,
          is_published: Boolean(module.is_published),
          is_locked: Boolean(module.is_locked),
        });
      } else {
        reset({
          title: "",
          class_subject_id: classSubjectOptions[0]?.id || "",
          description: "",
          display_order: 1,
          is_published: false,
          is_locked: false,
        });
      }
    }
  }, [open, module, classSubjectOptions, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-dialog-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <BookOpen className="size-5" />
            </span>
            <div>
              <h2
                id="module-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg"
              >
                {isEdit ? "Ubah Modul Pembelajaran" : "Tambah Modul Pembelajaran"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit
                  ? "Perbarui informasi dan konfigurasi modul pembelajaran."
                  : "Buat modul baru dan kaitkan dengan mata pelajaran kelas."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup dialog modul"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          {/* Class Subject Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="module-class-subject" className="text-xs font-semibold sm:text-sm">
              Mata Pelajaran Kelas <span className="text-red-500">*</span>
            </Label>
            <Select
              id="module-class-subject"
              {...register("class_subject_id")}
              className="h-10 text-xs sm:text-sm"
            >
              <option value="">Pilih Mata Pelajaran Kelas</option>
              {classSubjectOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </Select>
            {errors.class_subject_id && (
              <p className="text-xs font-medium text-red-500">
                {errors.class_subject_id.message}
              </p>
            )}
          </div>

          {/* Module Title */}
          <div className="space-y-1.5">
            <Label htmlFor="module-title" className="text-xs font-semibold sm:text-sm">
              Judul Modul <span className="text-red-500">*</span>
            </Label>
            <Input
              id="module-title"
              type="text"
              {...register("title")}
              placeholder="Contoh: Modul 1: Pengantar Algoritma dan Pemrograman"
              className="h-10 text-xs sm:text-sm"
            />
            {errors.title && (
              <p className="text-xs font-medium text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="module-desc" className="text-xs font-semibold sm:text-sm">
              Deskripsi Modul (Opsional)
            </Label>
            <textarea
              id="module-desc"
              rows={3}
              {...register("description")}
              placeholder="Deskripsi singkat mengenai capaian pembelajaran atau ruang lingkup modul..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:text-sm"
            />
          </div>

          {/* Display Order */}
          <div className="space-y-1.5">
            <Label htmlFor="module-order" className="text-xs font-semibold sm:text-sm">
              Nomor Urut Tampil
            </Label>
            <Input
              id="module-order"
              type="number"
              min={1}
              {...register("display_order", {
                setValueAs: (value: string | number | null | undefined) => {
                  if (value === "" || value === null || value === undefined) return null;
                  const num = Number(value);
                  return Number.isNaN(num) ? null : num;
                },
              })}
              placeholder="Contoh: 1"
              className="h-10 text-xs sm:text-sm"
            />
            {errors.display_order && (
              <p className="text-xs font-medium text-red-500">
                {errors.display_order.message}
              </p>
            )}
          </div>

          {/* Publication and Lock Toggles */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40 sm:grid-cols-2">
            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_published")}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>Diterbitkan (Tampil ke siswa)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_locked")}
                className="size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>Kunci Akses Modul</span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-9 px-4 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSaving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Modul"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
