import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { studentFormSchema, type StudentFormInput, type StudentFormValues } from "../schemas/studentSchema";
import type { Student, StudentDepartment, StudentProfile } from "../types";
import type { AcademicStatus } from "@/features/academic-statuses/types";

interface StudentDialogProps {
  open: boolean;
  student?: Student | null;
  profiles: StudentProfile[];
  departments: StudentDepartment[];
  academicStatuses: AcademicStatus[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: StudentFormValues) => Promise<void>;
}

const EMPTY_VALUES: StudentFormInput = { profileId: "", departmentId: "", academicStatusId: "", studentNumber: "", enrollmentYear: undefined };

export function StudentDialog({ open, student, profiles, departments, academicStatuses, isSaving, onClose, onSave }: StudentDialogProps) {
  const isEditing = Boolean(student);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentFormInput, unknown, StudentFormValues>({ resolver: zodResolver(studentFormSchema), defaultValues: EMPTY_VALUES });

  useEffect(() => {
    if (!open) return;
    reset(student ? {
      profileId: student.profileId,
      departmentId: student.departmentId ?? "",
      academicStatusId: student.academicStatusId,
      studentNumber: student.studentNumber,
      enrollmentYear: student.enrollmentYear ?? undefined,
    } : EMPTY_VALUES);
  }, [open, reset, student]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400"><GraduationCap className="size-5" /></span><div><h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEditing ? "Ubah Student" : "Tambah Student"}</h2><p className="text-xs text-slate-500 dark:text-slate-400">{isEditing ? "Perbarui data student" : "Tambahkan student baru ke dalam sistem"}</p></div></div><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Tutup dialog"><X className="size-5" /></button></div>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
        <div className="space-y-2"><Label htmlFor="student-profile" className="text-sm font-semibold">Profile <span className="text-red-500">*</span></Label><Select id="student-profile" {...register("profileId")} disabled={isEditing} className="h-11"><option value="">Pilih profile</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.fullName}{profile.email ? ` — ${profile.email}` : ""}</option>)}</Select>{isEditing && <p className="text-xs text-slate-500 dark:text-slate-400">Profile tidak diubah saat edit karena API Student hanya memperbarui field akademik.</p>}{errors.profileId && <p className="text-xs font-medium text-red-500">{errors.profileId.message}</p>}</div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="student-department" className="text-sm font-semibold">Department</Label><Select id="student-department" {...register("departmentId")} className="h-11"><option value="">Tanpa department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}{department.code ? ` (${department.code})` : ""}</option>)}</Select>{errors.departmentId && <p className="text-xs font-medium text-red-500">{errors.departmentId.message}</p>}</div><div className="space-y-2"><Label htmlFor="student-status" className="text-sm font-semibold">Academic Status <span className="text-red-500">*</span></Label><Select id="student-status" {...register("academicStatusId")} className="h-11"><option value="">Pilih status akademik</option>{academicStatuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}</Select>{errors.academicStatusId && <p className="text-xs font-medium text-red-500">{errors.academicStatusId.message}</p>}</div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="student-number" className="text-sm font-semibold">Student Number <span className="text-red-500">*</span></Label><Input id="student-number" {...register("studentNumber")} placeholder="Contoh: 20260001" className="h-11" />{errors.studentNumber && <p className="text-xs font-medium text-red-500">{errors.studentNumber.message}</p>}</div><div className="space-y-2"><Label htmlFor="student-year" className="text-sm font-semibold">Enrollment Year</Label><Input id="student-year" type="number" {...register("enrollmentYear", { valueAsNumber: true })} placeholder="Contoh: 2026" className="h-11" />{errors.enrollmentYear && <p className="text-xs font-medium text-red-500">{errors.enrollmentYear.message}</p>}</div></div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-sm font-semibold">Batal</Button><Button type="submit" disabled={isSaving} className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">{isSaving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Student"}</Button></div>
      </form>
    </div>
  </div>;
}

