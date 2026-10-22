import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Building2,
  Check,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeachers } from "@/features/teachers/hooks/useTeachers";
import { departmentFormSchema } from "../schemas/departmentSchema";
import type {
  DepartmentFormInput,
  DepartmentFormValues,
} from "../schemas/departmentSchema";
import type { Department } from "../types";

interface DepartmentDialogProps {
  open: boolean;
  department?: Department | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: DepartmentFormValues) => Promise<void>;
}

export function DepartmentDialog({
  open,
  department,
  isSaving,
  onClose,
  onSave,
}: DepartmentDialogProps) {
  const isEditing = Boolean(department);
  const [teacherSearch, setTeacherSearch] = useState("");

  const teachersQuery = useTeachers({ page: 1, limit: 100 });
  const availableTeachers = useMemo(
    () => teachersQuery.data?.data ?? [],
    [teachersQuery.data?.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormInput, unknown, DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      code: "",
      teacher_ids: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (department) {
        const assignedIds = (department.teachers ?? []).map((t) => t.id);
        reset({
          name: department.name,
          code: department.code,
          teacher_ids: assignedIds,
        });
      } else {
        reset({
          name: "",
          code: "",
          teacher_ids: [],
        });
      }
    }
  }, [open, department, reset]);

  const [selectedTeacherIds = []] = useWatch({
    control,
    name: ["teacher_ids"],
  });

  const toggleTeacher = (teacherId: string) => {
    const current = selectedTeacherIds ?? [];
    if (current.includes(teacherId)) {
      setValue(
        "teacher_ids",
        current.filter((id) => id !== teacherId),
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      setValue("teacher_ids", [...current, teacherId], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return availableTeachers;
    return availableTeachers.filter((t) => {
      const name = (t.profile?.fullName ?? "").toLowerCase();
      const num = (t.teacher_number ?? "").toLowerCase();
      return name.includes(q) || num.includes(q);
    });
  }, [availableTeachers, teacherSearch]);

  const onSubmit = async (values: DepartmentFormValues) => {
    await onSave(values);
  };

  const handleClose = () => {
    setTeacherSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Building2 className="size-5" />
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Data Departemen" : "Tambah Departemen Baru"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? "Perbarui nama, kode, dan daftar staf/guru yang bertugas di departemen ini."
              : "Masukkan nama departemen, kode identifikasi, dan tetapkan guru ke dalam unit ini."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Department Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Departemen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Departemen Akademik & Kurikulum"
              {...register("name")}
              className={`h-9 text-xs sm:text-sm ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Department Code */}
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kode Departemen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder="Contoh: AKAD, KESISWAAN, SARPRAS"
              {...register("code")}
              className={`h-9 text-xs sm:text-sm uppercase font-mono ${errors.code ? "border-red-500" : ""}`}
            />
            {errors.code && (
              <p className="text-[11px] font-medium text-red-500">{errors.code.message}</p>
            )}
          </div>

          {/* Assigned Teachers / Staff Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
                Tetapkan Guru / Staf
              </Label>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                <UserCheck className="size-3" />
                {(selectedTeacherIds ?? []).length} Guru Terpilih
              </span>
            </div>

            {/* Search teacher in modal */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <Input
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Cari guru berdasarkan nama atau NIP..."
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-950/50"
              />
            </div>

            {/* Teachers list picker */}
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 space-y-1 dark:border-slate-800 dark:bg-slate-950/30">
              {teachersQuery.isPending ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  Memuat data guru...
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  {teacherSearch.trim()
                    ? `Tidak ditemukan guru dengan kata kunci "${teacherSearch}".`
                    : "Belum ada guru yang terdaftar di institusi."}
                </div>
              ) : (
                filteredTeachers.map((teacher) => {
                  const isSelected = (selectedTeacherIds ?? []).includes(teacher.id);
                  const fullName = teacher.profile?.fullName ?? "Guru";
                  const teacherNumber = teacher.teacher_number;

                  return (
                    <button
                      type="button"
                      key={teacher.id}
                      onClick={() => toggleTeacher(teacher.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-blue-100/70 text-blue-900 font-semibold dark:bg-blue-900/40 dark:text-blue-200"
                          : "hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800/60 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-200/60 text-[10px] font-bold text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="truncate text-xs leading-none">{fullName}</p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5 font-mono">
                            NIP: {teacherNumber}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="size-3" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="h-9 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 text-xs font-semibold bg-gradient-to-r from-blue-700 to-indigo-600 text-white hover:from-blue-800 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-500"
            >
              {isSaving
                ? "Menyimpan..."
                : isEditing
                  ? "Simpan Perubahan"
                  : "Tambah Departemen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
