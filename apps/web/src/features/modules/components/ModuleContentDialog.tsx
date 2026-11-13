import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  type ModuleContentFormValues,
  moduleContentFormSchema,
} from "../schemas/moduleSchema";
import type { LearningModule, ModuleContent } from "../types";

interface ModuleContentDialogProps {
  open: boolean;
  parentModule: LearningModule | null;
  content?: ModuleContent | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: ModuleContentFormValues) => Promise<void>;
}

export const ModuleContentDialog: React.FC<ModuleContentDialogProps> = ({
  open,
  parentModule,
  content,
  isSaving,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(content);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuleContentFormValues>({
    resolver: zodResolver(moduleContentFormSchema),
    defaultValues: {
      moduleId: "",
      title: "",
      contentType: "text",
      content: "",
      fileId: null,
      sortOrder: null,
    },
  });

  useEffect(() => {
    if (open && parentModule) {
      if (content) {
        reset({
          moduleId: content.moduleId || parentModule.id,
          title: content.title,
          contentType: content.contentType || "text",
          content: content.content ?? "",
          fileId: content.fileId ?? null,
          sortOrder: content.sortOrder ?? null,
        });
      } else {
        const nextOrder = (parentModule.moduleContents?.length ?? 0) + 1;
        reset({
          moduleId: parentModule.id,
          title: "",
          contentType: "text",
          content: "",
          fileId: null,
          sortOrder: nextOrder,
        });
      }
    }
  }, [open, parentModule, content, reset]);

  if (!open || !parentModule) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-dialog-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <FileText className="size-5" />
            </span>
            <div>
              <h2
                id="content-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg"
              >
                {isEdit ? "Ubah Konten Materi" : "Tambah Konten Materi"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modul: <span className="font-semibold">{parentModule.title}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup dialog konten"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          <input type="hidden" {...register("moduleId")} />

          {/* Content Title */}
          <div className="space-y-1.5">
            <Label htmlFor="content-title" className="text-xs font-semibold sm:text-sm">
              Judul Konten / Materi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="content-title"
              type="text"
              {...register("title")}
              placeholder="Contoh: Pengantar dan Konsep Dasar Pemrograman"
              className="h-10 text-xs sm:text-sm"
            />
            {errors.title && (
              <p className="text-xs font-medium text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content Type & Sort Order in 2 cols */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="content-type" className="text-xs font-semibold sm:text-sm">
                Tipe Konten <span className="text-red-500">*</span>
              </Label>
              <Select
                id="content-type"
                {...register("contentType")}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="text">Teks / Artikel</option>
                <option value="video">Video (YouTube / URL)</option>
                <option value="pdf">Slide / PDF Dokumen</option>
                <option value="link">Tautan Referensi Web</option>
                <option value="document">Dokumen / Panduan</option>
              </Select>
              {errors.contentType && (
                <p className="text-xs font-medium text-red-500">
                  {errors.contentType.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content-sort-order" className="text-xs font-semibold sm:text-sm">
                Nomor Urut Materi
              </Label>
              <Input
                id="content-sort-order"
                type="number"
                min={1}
                {...register("sortOrder", {
                  setValueAs: (value: string | number | null | undefined) => {
                    if (value === "" || value === null || value === undefined) return null;
                    const num = Number(value);
                    return Number.isNaN(num) ? null : num;
                  },
                })}
                placeholder="Contoh: 1"
                className="h-10 text-xs sm:text-sm"
              />
              {errors.sortOrder && (
                <p className="text-xs font-medium text-red-500">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>
          </div>

          {/* Content Body / URL */}
          <div className="space-y-1.5">
            <Label htmlFor="content-body" className="text-xs font-semibold sm:text-sm">
              Isi Materi, Catatan Instruksional, atau URL Tautan
            </Label>
            <textarea
              id="content-body"
              rows={4}
              {...register("content")}
              placeholder="Masukkan teks rangkuman materi, link video/slide, atau petunjuk instruksional untuk peserta didik..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:text-sm"
            />
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
              className="h-9 px-4 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700"
            >
              {isSaving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Materi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
