import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAcademicYears } from "@/features/academic-years/hooks/useAcademicYears";
import { useTeachers } from "@/features/teachers/hooks/useTeachers";
import type { Teacher } from "@/features/teachers/types";
import { classFormSchema } from "../schemas/classSchema";
import type { ClassFormInput, ClassFormValues } from "../schemas/classSchema";
import type { ClassItem } from "../types";

interface Props {
  open: boolean;
  cls?: ClassItem | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: ClassFormValues) => Promise<void>;
}

export function ClassDialog({ open, cls, isSaving, onClose, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClassFormInput, unknown, ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      academic_year_id: "",
      name: "",
      grade_level: 1,
      homeroom_teacher_id: null,
    },
  });

  const academicYearsQuery = useAcademicYears();
  const teachersQuery = useTeachers({ page: 1, limit: 100 });

  useEffect(() => {
    if (open) {
      if (cls) {
        reset({
          academic_year_id: cls.academic_year_id,
          name: cls.name,
          grade_level: cls.grade_level,
          homeroom_teacher_id: cls.homeroom_teacher_id ?? null,
        });
      } else {
        reset({ academic_year_id: "", name: "", grade_level: 1, homeroom_teacher_id: null });
      }
    }
  }, [open, cls, reset]);

  const onSubmit = async (values: ClassFormValues) => {
    await onSave(values);
  };

  const academicYears = academicYearsQuery.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{cls ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="class-name">Nama Kelas</Label>
            <Input id="class-name" {...register("name")} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="class-academic-year">Tahun Ajaran</Label>
            <Select id="class-academic-year" className="w-full rounded border px-2 py-2" {...register("academic_year_id")}>
              <option value="">Pilih tahun ajaran</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>{ay.academic_year}</option>
              ))}
            </Select>
            {errors.academic_year_id && <p className="text-xs text-red-600">{errors.academic_year_id.message}</p>}
          </div>
          <div>
            <Label htmlFor="class-grade-level">Tingkat</Label>
            <Input id="class-grade-level" type="number" min={1} step={1} {...register("grade_level", { valueAsNumber: true })} />
            {errors.grade_level && <p className="text-xs text-red-600">{errors.grade_level.message}</p>}
          </div>
          <div>
            <Label htmlFor="class-teacher">Wali Kelas (opsional)</Label>
            <Select id="class-teacher" className="w-full rounded border px-2 py-2" {...register("homeroom_teacher_id", { setValueAs: (value) => value === "" ? null : value })}>
              <option value="">-</option>
              {teachers.map((t: Teacher) => (
                <option key={t.id} value={t.id}>{t.profile?.fullName ?? t.teacher_number}</option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
