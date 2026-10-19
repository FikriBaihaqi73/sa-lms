import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Check, Copy, GraduationCap, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { studentFormSchema, type StudentFormInput, type StudentFormValues } from "../schemas/studentSchema";
import { defaultReferralExpiry, generateReferralCode, isReferralExpired } from "../utils/referralCode";
import type { Student, StudentDepartment } from "../types";
import type { AcademicStatus } from "@/features/academic-statuses/types";

interface StudentDialogProps {
  open: boolean;
  student?: Student | null;
  departments: StudentDepartment[];
  academicStatuses: AcademicStatus[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: StudentFormValues) => Promise<void>;
}

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function formatExpiryLabel(expiresAt: string): string {
  const parsed = new Date(`${expiresAt}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return expiresAt;
  return parsed.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

const EMPTY_VALUES: StudentFormInput = {
  profileId: "",
  departmentId: "",
  academicStatusId: "",
  studentNumber: "",
  enrollmentYear: undefined,
  referralCode: "",
  referralExpiresAt: "",
};

export function StudentDialog({ open, student, departments, academicStatuses, isSaving, onClose, onSave }: StudentDialogProps) {
  const isEditing = Boolean(student);
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<StudentFormInput, unknown, StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const [referralCode, referralExpiresAt] = useWatch({
    control,
    name: ["referralCode", "referralExpiresAt"],
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isCopied = Boolean(referralCode) && copiedCode === referralCode;
  const referralExpired = isReferralExpired(referralExpiresAt);

  useEffect(() => {
    if (!open) return;
    reset(student ? {
      profileId: student.profileId ?? "",
      departmentId: student.departmentId ?? "",
      academicStatusId: student.academicStatusId,
      studentNumber: student.studentNumber,
      enrollmentYear: student.enrollmentYear ?? undefined,
      referralCode: student.referralCode ?? "",
      referralExpiresAt: formatDateForInput(student.referralExpiresAt),
    } : EMPTY_VALUES);
  }, [open, reset, student]);

  const handleGenerateReferralCode = useCallback(() => {
    const code = generateReferralCode();
    setValue("referralCode", code, { shouldValidate: false, shouldDirty: true });
    if (!referralExpiresAt) {
      setValue("referralExpiresAt", defaultReferralExpiry(), { shouldValidate: false, shouldDirty: true });
    }
    toast.success("Kode referral baru dibuat.");
  }, [referralExpiresAt, setValue]);

  const handleCopyReferralCode = useCallback(async () => {
    if (!referralCode) {
      toast.error("Belum ada kode referral untuk disalin.");
      return;
    }
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(referralCode);
      toast.success("Kode referral disalin ke clipboard.");
      window.setTimeout(() => setCopiedCode((current) => (current === referralCode ? null : current)), 2000);
    } catch {
      toast.error("Gagal menyalin kode referral. Salin manual dari kolom kode.");
    }
  }, [referralCode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="student-dialog-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h2 id="student-dialog-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEditing ? "Ubah Siswa" : "Tambah Siswa"}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? "Perbarui data siswa" : "Data master siswa saja, tanpa membuat akun login."}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Tutup dialog">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student-number" className="text-sm font-semibold">
                Nomor Siswa <span className="text-red-500">*</span>
              </Label>
              <Input id="student-number" {...register("studentNumber")} placeholder="Contoh: 20260001" className="h-11" disabled={isSaving} />
              {errors.studentNumber && <p className="text-xs font-medium text-red-500">{errors.studentNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-status" className="text-sm font-semibold">
                Status Akademik <span className="text-red-500">*</span>
              </Label>
              <Select id="student-status" {...register("academicStatusId")} className="h-11" disabled={isSaving}>
                <option value="">Pilih status akademik</option>
                {academicStatuses.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </Select>
              {errors.academicStatusId && <p className="text-xs font-medium text-red-500">{errors.academicStatusId.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student-department" className="text-sm font-semibold">Jurusan</Label>
              <Select id="student-department" {...register("departmentId")} className="h-11" disabled={isSaving}>
                <option value="">Tanpa jurusan</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}{department.code ? ` (${department.code})` : ""}</option>
                ))}
              </Select>
              {errors.departmentId && <p className="text-xs font-medium text-red-500">{errors.departmentId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-year" className="text-sm font-semibold">Tahun Masuk</Label>
              <Input id="student-year" type="number" {...register("enrollmentYear", { valueAsNumber: true })} placeholder="Contoh: 2026" className="h-11" disabled={isSaving} />
              {errors.enrollmentYear && <p className="text-xs font-medium text-red-500">{errors.enrollmentYear.message}</p>}
            </div>
          </div>



          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kode Referral</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Kode dipakai saat siswa mendaftar akun. Berlaku sampai tanggal kedaluwarsa.
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleGenerateReferralCode} disabled={isSaving} className="h-10 shrink-0 px-3 text-sm font-semibold">
                <RefreshCw className="size-4" />
                {referralCode ? "Buat ulang" : "Buat kode"}
              </Button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="student-referral-code" className="text-sm font-semibold">Kode Referral</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="student-referral-code"
                    {...register("referralCode")}
                    placeholder="Contoh: REF-2026-A1B2C3"
                    className="h-11 flex-1 font-mono"
                    disabled={isSaving}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyReferralCode}
                    disabled={isSaving || !referralCode}
                    aria-label="Salin kode referral"
                    className="h-11 shrink-0 px-3"
                  >
                    {isCopied ? <Check className="size-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                {errors.referralCode && <p className="text-xs font-medium text-red-500">{errors.referralCode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-referral-expires" className="text-sm font-semibold">Tanggal Expired Referral</Label>
                <Input id="student-referral-expires" type="date" {...register("referralExpiresAt")} className="h-11" disabled={isSaving} />
                {errors.referralExpiresAt && <p className="text-xs font-medium text-red-500">{errors.referralExpiresAt.message}</p>}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kosongkan tanggal bila kode referral tidak dibatasi masa berlaku.
              </p>
              {referralExpiresAt && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${referralExpired ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"}`}>
                  {referralExpired ? <CalendarClock className="size-3.5" /> : <Check className="size-3.5" />}
                  {referralExpired ? "Kode referral sudah kedaluwarsa" : `Berlaku sampai ${formatExpiryLabel(referralExpiresAt)}`}
                </span>
              )}
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-sm font-semibold">
              Batal
            </Button>
            <Button type="submit" disabled={isSaving} className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSaving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Siswa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
