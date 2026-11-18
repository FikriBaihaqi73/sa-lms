import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  type StudyResultFormValues,
  studyResultFormSchema,
} from "../schemas/studyResultSchema";
import type {
  AcademicStatusOption,
  AcademicYearOption,
  SemesterOption,
  StudentOption,
  StudyResult,
} from "../types";

interface StudyResultDialogProps {
  open: boolean;
  result?: StudyResult | null;
  students: StudentOption[];
  academicYears: AcademicYearOption[];
  semesters: SemesterOption[];
  academicStatuses: AcademicStatusOption[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: StudyResultFormValues) => Promise<void>;
}

export const StudyResultDialog: React.FC<StudyResultDialogProps> = ({
  open,
  result,
  students,
  academicYears,
  semesters,
  academicStatuses,
  isSaving,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(result);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudyResultFormValues>({
    resolver: zodResolver(studyResultFormSchema),
    defaultValues: {
      studentId: "",
      academicYearId: "",
      semesterId: "",
      academicStatusId: null,
      totalCredits: null,
      semesterGpa: null,
      cumulativeGpa: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (result) {
        reset({
          studentId: result.studentId,
          academicYearId: result.academicYearId,
          semesterId: result.semesterId,
          academicStatusId: result.academicStatusId ?? null,
          totalCredits: result.totalCredits ?? null,
          semesterGpa:
            result.semesterGpa !== null ? Number(result.semesterGpa) : null,
          cumulativeGpa:
            result.cumulativeGpa !== null ? Number(result.cumulativeGpa) : null,
        });
      } else {
        const defaultAy = academicYears.find((ay) => ay.is_active)?.id || academicYears[0]?.id || "";
        const defaultSem = semesters.find((s) => s.is_active)?.id || semesters[0]?.id || "";
        const defaultStatus = academicStatuses[0]?.id || null;

        reset({
          studentId: students[0]?.id || "",
          academicYearId: defaultAy,
          semesterId: defaultSem,
          academicStatusId: defaultStatus,
          totalCredits: 20,
          semesterGpa: 3.5,
          cumulativeGpa: 3.5,
        });
      }
    }
  }, [open, result, students, academicYears, semesters, academicStatuses, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-result-dialog-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h2
                id="study-result-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg"
              >
                {isEdit ? "Ubah Rekap Nilai Siswa" : "Tambah Rekap Nilai Siswa"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit
                  ? "Perbarui hasil studi, SKS, dan indeks prestasi siswa."
                  : "Input data hasil studi semester baru untuk siswa."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup dialog rekap nilai"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          {/* Siswa Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="study-result-student" className="text-xs font-semibold sm:text-sm">
              Siswa <span className="text-red-500">*</span>
            </Label>
            <Select
              id="study-result-student"
              {...register("studentId")}
              disabled={isEdit}
              className="h-10 text-xs sm:text-sm"
            >
              <option value="">Pilih Siswa</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.studentNumber} - {st.fullName}
                </option>
              ))}
            </Select>
            {errors.studentId && (
              <p className="text-xs font-medium text-red-500">
                {errors.studentId.message}
              </p>
            )}
          </div>

          {/* Tahun Ajaran & Semester */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="study-result-ay" className="text-xs font-semibold sm:text-sm">
                Tahun Ajaran <span className="text-red-500">*</span>
              </Label>
              <Select
                id="study-result-ay"
                {...register("academicYearId")}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="">Pilih Tahun Ajaran</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.academic_year} {ay.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </Select>
              {errors.academicYearId && (
                <p className="text-xs font-medium text-red-500">
                  {errors.academicYearId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="study-result-sem" className="text-xs font-semibold sm:text-sm">
                Semester <span className="text-red-500">*</span>
              </Label>
              <Select
                id="study-result-sem"
                {...register("semesterId")}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="">Pilih Semester</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </Select>
              {errors.semesterId && (
                <p className="text-xs font-medium text-red-500">
                  {errors.semesterId.message}
                </p>
              )}
            </div>
          </div>

          {/* Status Akademik & Beban SKS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="study-result-status" className="text-xs font-semibold sm:text-sm">
                Status Akademik
              </Label>
              <Select
                id="study-result-status"
                {...register("academicStatusId")}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="">Pilih Status</option>
                {academicStatuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="study-result-credits" className="text-xs font-semibold sm:text-sm">
                Beban SKS
              </Label>
              <Input
                id="study-result-credits"
                type="number"
                min={0}
                max={100}
                placeholder="Contoh: 24"
                {...register("totalCredits", {
                  setValueAs: (v: string | number | null) =>
                    v === "" || v === null || v === undefined ? null : Number(v),
                })}
                className="h-10 text-xs sm:text-sm"
              />
              {errors.totalCredits && (
                <p className="text-xs font-medium text-red-500">
                  {errors.totalCredits.message}
                </p>
              )}
            </div>
          </div>

          {/* Indeks Prestasi (IPS & IPK) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="study-result-sgpa" className="text-xs font-semibold sm:text-sm">
                IPS (Indeks Prestasi Semester)
              </Label>
              <Input
                id="study-result-sgpa"
                type="number"
                step="0.01"
                min={0}
                max={4.0}
                placeholder="Contoh: 3.75"
                {...register("semesterGpa", {
                  setValueAs: (v: string | number | null) =>
                    v === "" || v === null || v === undefined ? null : Number(v),
                })}
                className="h-10 text-xs sm:text-sm"
              />
              {errors.semesterGpa && (
                <p className="text-xs font-medium text-red-500">
                  {errors.semesterGpa.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="study-result-cgpa" className="text-xs font-semibold sm:text-sm">
                IPK (Indeks Prestasi Kumulatif)
              </Label>
              <Input
                id="study-result-cgpa"
                type="number"
                step="0.01"
                min={0}
                max={4.0}
                placeholder="Contoh: 3.80"
                {...register("cumulativeGpa", {
                  setValueAs: (v: string | number | null) =>
                    v === "" || v === null || v === undefined ? null : Number(v),
                })}
                className="h-10 text-xs sm:text-sm"
              />
              {errors.cumulativeGpa && (
                <p className="text-xs font-medium text-red-500">
                  {errors.cumulativeGpa.message}
                </p>
              )}
            </div>
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
              {isSaving
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Rekap Nilai"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
