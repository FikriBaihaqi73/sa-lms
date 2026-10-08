import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { teacherFormSchema, type TeacherFormInput, type TeacherFormValues } from "../schemas/teacherSchema";
import type { TeacherFormProfile, TeacherReference } from "../types";

interface TeacherDialogProps {
  open: boolean;
  profiles: TeacherFormProfile[];
  statuses: TeacherReference[];
  specializations: TeacherReference[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: TeacherFormValues) => Promise<void>;
}

const EMPTY_VALUES: TeacherFormInput = {
  profile_id: "",
  teacher_number: "",
  specialization_id: "",
  employment_status_id: "",
  join_date: "",
};


export function TeacherDialogForm({
  open,
  profiles,
  statuses,
  specializations,
  isSaving,
  onClose,
  onSave,
  title,
  subtitle,
  submitLabel,
  initialValues,
  lockProfile,
}: TeacherDialogProps & {
  title: string;
  subtitle: string;
  submitLabel: string;
  initialValues?: TeacherFormInput;
  lockProfile?: boolean;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<
    TeacherFormInput,
    unknown,
    TeacherFormValues
  >({ resolver: zodResolver(teacherFormSchema), defaultValues: initialValues ?? EMPTY_VALUES });

  useEffect(() => {
    if (!open) return;
    reset(initialValues ?? EMPTY_VALUES);
  }, [open, reset, initialValues]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Tutup dialog">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="teacher-profile" className="text-sm font-semibold">
              Profil guru <span className="text-red-500">*</span>
            </Label>
            <Select id="teacher-profile" {...register("profile_id")} disabled={lockProfile} className="h-11">
              <option value="">Pilih profil</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName}
                  {profile.email ? ` — ${profile.email}` : ""}
                </option>
              ))}
            </Select>
            {errors.profile_id && <p className="text-xs font-medium text-red-500">{errors.profile_id.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-number" className="text-sm font-semibold">
                NIP <span className="text-red-500">*</span>
              </Label>
              <Input id="teacher-number" {...register("teacher_number")} placeholder="Contoh: 198501012010011001" className="h-11 font-mono" />
              {errors.teacher_number && <p className="text-xs font-medium text-red-500">{errors.teacher_number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-join-date" className="text-sm font-semibold">Tanggal bergabung</Label>
              <Input id="teacher-join-date" type="date" {...register("join_date")} className="h-11" />
              {errors.join_date && <p className="text-xs font-medium text-red-500">{errors.join_date.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-status" className="text-sm font-semibold">Status kepegawaian</Label>
              <Select id="teacher-status" {...register("employment_status_id")} className="h-11">
                <option value="">Tanpa status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </Select>
              {errors.employment_status_id && <p className="text-xs font-medium text-red-500">{errors.employment_status_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-specialization" className="text-sm font-semibold">Spesialisasi</Label>
              <Select id="teacher-specialization" {...register("specialization_id")} className="h-11">
                <option value="">Tanpa spesialisasi</option>
                {specializations.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
              {errors.specialization_id && <p className="text-xs font-medium text-red-500">{errors.specialization_id.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-sm font-semibold">
              Batal
            </Button>
            <Button type="submit" disabled={isSaving} className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
              {isSaving ? "Menyimpan..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
