import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  CalendarClock,
  Check,
  Copy,
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { generateReferralCode } from "../lib/referral-utils";
import {
  referralCodeFormSchema,
  type ReferralCodeFormInput,
  type ReferralCodeFormValues,
} from "../schemas/referralCodeSchema";
import type { CreateReferralCodeInput, ReferralCodeDepartment } from "../types";

interface CreateReferralCodeDialogProps {
  open: boolean;
  departments: ReferralCodeDepartment[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: CreateReferralCodeInput) => Promise<void>;
}

export function CreateReferralCodeDialog({
  open,
  departments,
  isSaving,
  onClose,
  onSave,
}: CreateReferralCodeDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReferralCodeFormInput, unknown, ReferralCodeFormValues>({
    resolver: zodResolver(referralCodeFormSchema),
    defaultValues: {
      code: "",
      hasQuotaLimit: false,
      usageQuota: undefined,
      enrollmentYear: undefined,
      departmentId: "",
      hasExpiryLimit: false,
      expiresAt: "",
      isActive: true,
    },
  });

  const [code, hasQuotaLimit, hasExpiryLimit] = useWatch({
    control,
    name: ["code", "hasQuotaLimit", "hasExpiryLimit"],
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copied = Boolean(code && copiedCode === code);

  // Initialize with a new auto-generated code whenever opened
  useEffect(() => {
    if (!open) return;
    const initialCode = generateReferralCode();
    reset({
      code: initialCode,
      hasQuotaLimit: false,
      usageQuota: undefined,
      enrollmentYear: undefined,
      departmentId: "",
      hasExpiryLimit: false,
      expiresAt: "",
      isActive: true,
    });
  }, [open, reset]);

  const handleRegenerateCode = useCallback(() => {
    const nextCode = generateReferralCode();
    setValue("code", nextCode, { shouldValidate: true, shouldDirty: true });
    toast.success("Kode referral baru di-generate.");
  }, [setValue]);

  const handleCopyCode = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Kode referral disalin ke clipboard!");
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Gagal menyalin kode. Silakan salin manual.");
    }
  }, [code]);

  const handleFormSubmit = async (values: ReferralCodeFormValues) => {
    const payload: CreateReferralCodeInput = {
      code: values.code?.trim() || undefined,
      usageQuota: values.hasQuotaLimit && values.usageQuota ? values.usageQuota : null,
      enrollmentYear: values.enrollmentYear ?? null,
      departmentId: values.departmentId || null,
      expiresAt: values.hasExpiryLimit && values.expiresAt ? values.expiresAt : null,
      isActive: values.isActive ?? true,
    };
    await onSave(payload);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="referral-code-dialog-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <Ticket className="size-5" />
            </span>
            <div>
              <h2
                id="referral-code-dialog-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Buat Kode Referral (Tambah Siswa)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Buat kode referral baru untuk pendaftaran mandiri calon siswa ke institusi Anda.
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 p-6">
          {/* Card Generator Kode Referral */}
          <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue-200 bg-white text-blue-600 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-400">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Kode Referral Otomatis
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Kode dibuat otomatis dan dijamin unik. Anda dapat mengacak ulang atau mengubahnya.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerateCode}
                disabled={isSaving}
                className="h-9 shrink-0 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="size-3.5" />
                Acak Ulang
              </Button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Input
                id="referral-code"
                {...register("code")}
                placeholder="REF-2026-XXXXXX"
                className="h-11 flex-1 font-mono text-base font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300"
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyCode}
                disabled={isSaving || !code}
                className="h-11 shrink-0 px-3.5"
                title="Salin kode"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            {errors.code && (
              <p className="mt-1 text-xs font-medium text-red-500">{errors.code.message}</p>
            )}
          </section>

          {/* Pengaturan Opsional Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pengaturan Pendaftaran (Opsional)
            </h4>

            {/* 1. Kuota Penggunaan */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 text-slate-500 dark:text-slate-400" />
                  <div>
                    <Label htmlFor="quota-toggle" className="cursor-pointer text-sm font-semibold">
                      Batasi Kuota Penggunaan
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tentukan jumlah maksimal siswa yang dapat mendaftar dengan kode ini.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    id="quota-toggle"
                    type="checkbox"
                    {...register("hasQuotaLimit")}
                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Aktifkan Batas</span>
                </label>
              </div>

              {hasQuotaLimit ? (
                <div className="mt-3 max-w-xs space-y-1">
                  <Label htmlFor="usage-quota" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Jumlah Maksimal Pendaftar
                  </Label>
                  <Input
                    id="usage-quota"
                    type="number"
                    min={1}
                    {...register("usageQuota")}
                    placeholder="Contoh: 50"
                    className="h-10"
                    disabled={isSaving}
                  />
                  {errors.usageQuota && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.usageQuota.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Tanpa batas kuota (dapat digunakan oleh banyak pendaftar).
                </div>
              )}
            </div>

            {/* 2. Tahun Masuk & Jurusan */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="enrollment-year" className="flex items-center gap-1.5 text-sm font-semibold">
                  <Calendar className="size-4 text-slate-500" />
                  <span>Tahun Masuk</span>
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                    (Opsional)
                  </span>
                </Label>
                <Input
                  id="enrollment-year"
                  type="number"
                  placeholder="Contoh: 2026 (Kosongkan jika semua tahun)"
                  min={2000}
                  max={2100}
                  {...register("enrollmentYear")}
                  className="h-11"
                  disabled={isSaving}
                />
                {errors.enrollmentYear && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.enrollmentYear.message}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tulis tahun masuk manual (opsional). Kosongkan jika berlaku untuk semua tahun.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department-id" className="flex items-center gap-1.5 text-sm font-semibold">
                  <Layers className="size-4 text-slate-500" />
                  <span>Jurusan</span>
                </Label>
                <Select
                  id="department-id"
                  {...register("departmentId")}
                  className="h-11"
                  disabled={isSaving}
                >
                  <option value="">Semua Jurusan</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {dept.code ? `(${dept.code})` : ""}
                    </option>
                  ))}
                </Select>
                {errors.departmentId && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.departmentId.message}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih jurusan tujuan atau biarkan berlaku untuk semua jurusan.
                </p>
              </div>
            </div>

            {/* 3. Masa Berlaku / Tanggal Kedaluwarsa */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <CalendarClock className="size-4 text-slate-500 dark:text-slate-400" />
                  <div>
                    <Label htmlFor="expiry-toggle" className="cursor-pointer text-sm font-semibold">
                      Batasi Masa Berlaku
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tentukan batas tanggal terakhir kode dapat digunakan.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    id="expiry-toggle"
                    type="checkbox"
                    {...register("hasExpiryLimit")}
                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Aktifkan Kedaluwarsa</span>
                </label>
              </div>

              {hasExpiryLimit ? (
                <div className="mt-3 max-w-xs space-y-1">
                  <Label htmlFor="expires-at" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Tanggal Kedaluwarsa
                  </Label>
                  <Input
                    id="expires-at"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...register("expiresAt")}
                    className="h-10"
                    disabled={isSaving}
                  />
                  {errors.expiresAt && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.expiresAt.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Tanpa batas waktu (kode berlaku selamanya selama berstatus aktif).
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
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
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSaving ? "Menyimpan..." : "Buat Kode Referral"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
