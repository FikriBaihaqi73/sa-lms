import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gradeRowFormSchema, type GradeRowFormValues } from "../schemas/grade-schema";
import type { GradeRow, UpdateGradeInput } from "../types";

interface Props { row: GradeRow; isSaving: boolean; onClose: () => void; onSave: (v: UpdateGradeInput) => Promise<void>; }

export function EditGradeDialog({ row, isSaving, onClose, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GradeRowFormValues>({
    resolver: zodResolver(gradeRowFormSchema),
    defaultValues: { tugas: row.tugas, uts: row.uts, uas: row.uas },
  });
  useEffect(() => {
    reset({ tugas: row.tugas, uts: row.uts, uas: row.uas });
  }, [row, reset]);
  const numberField = {
    setValueAs: (value: string | number | null | undefined): number | null => {
      if (value === "" || value === null || value === undefined) return null;
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    },
  } as const;
  const submit = async (v: GradeRowFormValues) => {
    await onSave({ assignmentScore: v.tugas, midExamScore: v.uts, finalExamScore: v.uas });
  };
  const field = "h-11 border-slate-200 dark:border-slate-700";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
              <PencilLine className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Nilai - {row.studentName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{row.studentNumber} - {row.subjectName} ({row.className})</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(submit)} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tugas">Tugas (30%)</Label>
              <Input id="tugas" type="number" min={0} max={100} {...register("tugas", numberField)} className={field} placeholder="0-100" />
              {errors.tugas && <p className="text-xs font-medium text-red-500">{errors.tugas.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uts">UTS (30%)</Label>
              <Input id="uts" type="number" min={0} max={100} {...register("uts", numberField)} className={field} placeholder="0-100" />
              {errors.uts && <p className="text-xs font-medium text-red-500">{errors.uts.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uas">UAS (40%)</Label>
              <Input id="uas" type="number" min={0} max={100} {...register("uas", numberField)} className={field} placeholder="0-100" />
              {errors.uas && <p className="text-xs font-medium text-red-500">{errors.uas.message}</p>}
            </div>
          </div>
          <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            Nilai akhir dihitung otomatis: Tugas 30% + UTS 30% + UAS 40%. Kosongkan kolom jika nilai belum tersedia.
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-sm font-semibold">Batal</Button>
            <Button type="submit" disabled={isSaving} className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
