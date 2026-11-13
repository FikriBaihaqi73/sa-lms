import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ClipboardCheck, Palette, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AttendanceStatusFormValues,
  attendanceStatusFormSchema,
} from "../schemas/attendanceStatusSchema";
import type { AttendanceStatus } from "../types";
import {
  AttendanceStatusBadge,
  AttendanceStatusIcon,
  COLOR_PRESETS,
  LETTER_ICONS,
  STANDARD_ICONS,
} from "./attendance-status-icon";

interface AttendanceStatusDialogProps {
  open: boolean;
  attendanceStatus?: AttendanceStatus | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: AttendanceStatusFormValues) => Promise<void>;
  serverError?: { field: string; message: string } | null;
  onFieldChange?: () => void;
}

export function AttendanceStatusDialog({
  open,
  attendanceStatus,
  isSaving,
  onClose,
  onSave,
  serverError,
  onFieldChange,
}: AttendanceStatusDialogProps) {
  const isEditing = Boolean(attendanceStatus);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<AttendanceStatusFormValues>({
    resolver: zodResolver(attendanceStatusFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#2563EB",
      icon: "check",
    },
  });

  const watchedName = useWatch({ control, name: "name" });
  const watchedColor = useWatch({ control, name: "color" });
  const watchedIcon = useWatch({ control, name: "icon" });

  useEffect(() => {
    reset({
      name: attendanceStatus?.name ?? "",
      description: attendanceStatus?.description ?? "",
      color: attendanceStatus?.color ?? "#2563EB",
      icon: attendanceStatus?.icon ?? "check",
    });
  }, [attendanceStatus, reset]);

  if (!open) return null;

  const nameField = register("name");
  const descriptionField = register("description");

  const currentColor = watchedColor || "#2563EB";
  const currentIcon = watchedIcon || "check";

  const handleSelectColor = (hex: string) => {
    setValue("color", hex, { shouldValidate: true });
    onFieldChange?.();
  };

  const handleSelectIcon = (iconId: string) => {
    setValue("icon", iconId, { shouldValidate: true });
    onFieldChange?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-status-dialog-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <ClipboardCheck className="size-5" />
            </span>
            <div>
              <h2
                id="attendance-status-dialog-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {isEditing
                  ? "Ubah Status Kehadiran"
                  : "Tambah Status Kehadiran"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? "Perbarui nama, warna, dan ikon status kehadiran"
                  : "Tambahkan status kehadiran baru dengan pilihan warna dan ikon"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSave)}
          className="flex-1 space-y-5 overflow-y-auto p-6"
        >
          {/* Real-Time Preview Card */}
          <section
            aria-label="Pratinjau Status Kehadiran"
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Sparkles className="size-3.5 text-amber-500" /> Pratinjau
                Tampilan
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentColor}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <AttendanceStatusBadge
                name={watchedName?.trim() || "Contoh Status"}
                color={currentColor}
                icon={currentIcon}
                className="text-sm py-1.5 px-3.5"
              />
            </div>
          </section>

          {/* Nama Status */}
          <div className="space-y-2">
            <Label
              htmlFor="attendance-status-name"
              className="text-sm font-semibold"
            >
              Nama Status <span className="text-red-500">*</span>
            </Label>
            <Input
              id="attendance-status-name"
              {...nameField}
              onChange={(event) => {
                nameField.onChange(event);
                onFieldChange?.();
              }}
              placeholder="Contoh: Hadir, Izin, Sakit, Alpa"
              className="h-11"
              disabled={isSaving}
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500">
                {errors.name.message}
              </p>
            )}
            {serverError?.field === "name" && (
              <p className="text-xs font-medium text-red-500">
                {serverError.message}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label
              htmlFor="attendance-status-description"
              className="text-sm font-semibold"
            >
              Deskripsi{" "}
              <span className="text-xs font-normal text-slate-500">
                (Opsional)
              </span>
            </Label>
            <textarea
              id="attendance-status-description"
              {...descriptionField}
              onChange={(event) => {
                descriptionField.onChange(event);
                onFieldChange?.();
              }}
              rows={2}
              placeholder="Tambahkan keterangan atau ketentuan status kehadiran..."
              disabled={isSaving}
              className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Pilih Warna */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Pilih Warna <span className="text-red-500">*</span>
              </Label>
              <span className="text-xs text-slate-500">
                Preset atau warna kustom
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_PRESETS.map((preset) => {
                const isSelected =
                  currentColor.toUpperCase() === preset.hex.toUpperCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleSelectColor(preset.hex)}
                    disabled={isSaving}
                    aria-label={`Pilih warna ${preset.label} (${preset.hex})`}
                    aria-pressed={isSelected}
                    className={`group relative flex size-9 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                      isSelected
                        ? "ring-2 ring-slate-900 ring-offset-2 dark:ring-white"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && (
                      <Check className="size-4 text-white drop-shadow-sm" />
                    )}
                  </button>
                );
              })}

              {/* Custom Color Input */}
              <div className="relative flex items-center gap-2 pl-1">
                <label
                  htmlFor="custom-color-picker"
                  title="Pilih warna kustom"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 transition-transform hover:scale-105 dark:border-slate-700 dark:bg-slate-800"
                >
                  <Palette className="size-4 text-slate-600 dark:text-slate-300" />
                  <input
                    id="custom-color-picker"
                    type="color"
                    value={
                      currentColor.startsWith("#") && currentColor.length === 7
                        ? currentColor
                        : "#2563EB"
                    }
                    onChange={(e) => handleSelectColor(e.target.value)}
                    disabled={isSaving}
                    className="sr-only"
                    aria-label="Pemilih warna kustom"
                  />
                </label>
                <input
                  type="text"
                  value={watchedColor || ""}
                  onChange={(e) => handleSelectColor(e.target.value)}
                  placeholder="#2563EB"
                  maxLength={7}
                  disabled={isSaving}
                  aria-label="Kode warna HEX"
                  className="h-8 w-24 rounded border border-slate-200 bg-white px-2 font-mono text-xs text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
            </div>
            {errors.color && (
              <p className="text-xs font-medium text-red-500">
                {errors.color.message}
              </p>
            )}
          </div>

          {/* Pilih Ikon */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Pilih Ikon atau Huruf <span className="text-red-500">*</span>
            </Label>

            {/* Standard Icons */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Ikon Standar
              </p>
              <div className="grid grid-cols-4 gap-2">
                {STANDARD_ICONS.map((iconItem) => {
                  const isSelected = currentIcon === iconItem.id;
                  return (
                    <button
                      key={iconItem.id}
                      type="button"
                      onClick={() => handleSelectIcon(iconItem.id)}
                      disabled={isSaving}
                      aria-label={`Pilih ikon ${iconItem.label}`}
                      aria-pressed={isSelected}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                      }`}
                    >
                      <AttendanceStatusIcon
                        icon={iconItem.id}
                        className="size-5"
                      />
                      <span>{iconItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Letter Icons (A-Z) */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Huruf Tunggal (A–Z)
              </p>
              <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-13">
                {LETTER_ICONS.map((letterItem) => {
                  const isSelected = currentIcon === letterItem.id;
                  return (
                    <button
                      key={letterItem.id}
                      type="button"
                      onClick={() => handleSelectIcon(letterItem.id)}
                      disabled={isSaving}
                      aria-label={`Pilih huruf ${letterItem.letter}`}
                      aria-pressed={isSelected}
                      className={`flex size-8 items-center justify-center rounded-lg border font-bold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-500"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                      }`}
                    >
                      {letterItem.letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {errors.icon && (
              <p className="text-xs font-medium text-red-500">
                {errors.icon.message}
              </p>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 px-4 text-sm font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSaving
                ? "Menyimpan..."
                : isEditing
                  ? "Simpan Perubahan"
                  : "Tambah Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
