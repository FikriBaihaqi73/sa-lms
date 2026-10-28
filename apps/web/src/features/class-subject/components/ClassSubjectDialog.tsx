import { useEffect, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { classSubjectSchema, type ClassSubjectFormInput, type ClassSubjectFormValues } from "../schemas/classSubjectSchema";
import type { ClassSubject, ClassSubjectOptions } from "../types";
import { classSubjectFormDefaults } from "../utils";

interface Props {
  open: boolean;
  item?: ClassSubject | null;
  options?: ClassSubjectOptions;
  isSaving: boolean;
  serverError?: { field: string; message: string } | null;
  onFieldChange: () => void;
  onClose: () => void;
  onSave: (values: ClassSubjectFormValues) => Promise<void>;
}

export function ClassSubjectDialog({ open, item, options, isSaving, serverError, onFieldChange, onClose, onSave }: Props) {
  const { register, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm<ClassSubjectFormInput, unknown, ClassSubjectFormValues>({
    resolver: zodResolver(classSubjectSchema),
    defaultValues: { class_id: "", subject_id: "", teacher_id: "", academic_year_id: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(classSubjectFormDefaults(item));
  }, [open, item, reset]);

  useEffect(() => {
    if (serverError?.field) setError(serverError.field as keyof ClassSubjectFormInput, { message: serverError.message });
  }, [serverError, setError]);

  const fieldError = (field: keyof ClassSubjectFormInput) => errors[field]?.message;
  const teacherName = (teacher: ClassSubjectOptions["teachers"][number]) => teacher.profile?.fullName ?? teacher.teacher_number;
  const academicYears = options?.academicYears ?? [];
  const itemAcademicYear = item?.academic_year;
  const displayAcademicYears = itemAcademicYear && itemAcademicYear.institution_id !== null && !academicYears.some((year) => year.id === itemAcademicYear.id)
    ? [...academicYears, itemAcademicYear]
    : academicYears;
  const selectRegister = (field: keyof ClassSubjectFormInput) => {
    const registered = register(field);
    return {
      ...registered,
      onChange: (event: ChangeEvent<HTMLSelectElement>) => {
        void registered.onChange(event);
        clearErrors(field);
        onFieldChange();
      },
    };
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{item ? "Ubah Mata Pelajaran Kelas" : "Tambah Mata Pelajaran Kelas"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div><Label htmlFor="class-subject-class">Kelas</Label><Select id="class-subject-class" {...selectRegister("class_id")} disabled={!options || isSaving}><option value="">Pilih kelas</option>{options?.classes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</Select>{fieldError("class_id") && <p className="mt-1 text-xs text-red-500">{fieldError("class_id")}</p>}</div>
          <div><Label htmlFor="class-subject-subject">Mata Pelajaran</Label><Select id="class-subject-subject" {...selectRegister("subject_id")} disabled={!options || isSaving}><option value="">Pilih mata pelajaran</option>{options?.subjects.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</Select>{fieldError("subject_id") && <p className="mt-1 text-xs text-red-500">{fieldError("subject_id")}</p>}</div>
          <div><Label htmlFor="class-subject-teacher">Guru Pengampu</Label><Select id="class-subject-teacher" {...selectRegister("teacher_id")} disabled={!options || isSaving}><option value="">Pilih guru pengampu</option>{options?.teachers.map((option) => <option key={option.id} value={option.id}>{teacherName(option)}</option>)}</Select>{fieldError("teacher_id") && <p className="mt-1 text-xs text-red-500">{fieldError("teacher_id")}</p>}</div>
          <div><Label htmlFor="class-subject-academic-year">Tahun Ajaran</Label><Select id="class-subject-academic-year" {...selectRegister("academic_year_id")} disabled={!options || isSaving}><option value="">Pilih tahun ajaran</option>{displayAcademicYears.map((option) => <option key={option.id} value={option.id}>{option.academic_year}{option.is_active ? " (Aktif)" : ""}</option>)}</Select>{fieldError("academic_year_id") && <p className="mt-1 text-xs text-red-500">{fieldError("academic_year_id")}</p>}</div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Batal</Button><Button type="submit" disabled={isSaving || !options}>{isSaving ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
