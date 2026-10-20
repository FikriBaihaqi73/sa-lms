import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Award, Info, Sparkles } from "lucide-react";
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
import { gradeFormSchema } from "../schemas/gradeSchema";
import type { GradeFormInput, GradeFormValues } from "../schemas/gradeSchema";
import { formatScoreRange, getGradeColorBadge } from "../types";
import type { StandardGrade } from "../types";

interface GradeDialogProps {
  open: boolean;
  grade?: StandardGrade | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: GradeFormValues) => Promise<void>;
}

export function GradeDialog({
  open,
  grade,
  isSaving,
  onClose,
  onSave,
}: GradeDialogProps) {
  const isEditing = Boolean(grade);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<GradeFormInput, unknown, GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      grade: "",
      minimumScore: undefined,
      maximumScore: undefined,
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (grade) {
        reset({
          grade: grade.grade,
          minimumScore: grade.minimumScore ?? undefined,
          maximumScore: grade.maximumScore ?? undefined,
          description: grade.description ?? "",
        });
      } else {
        reset({
          grade: "",
          minimumScore: undefined,
          maximumScore: undefined,
          description: "",
        });
      }
    }
  }, [open, grade, reset]);

  const [gradeVal, minVal, maxVal, descVal] = useWatch({
    control,
    name: ["grade", "minimumScore", "maximumScore", "description"],
  });

  const watchedGrade = gradeVal || (isEditing ? grade?.grade || "A" : "A");
  const watchedMin = minVal;
  const watchedMax = maxVal;
  const watchedDesc = descVal;

  const previewTheme = getGradeColorBadge(watchedGrade);
  const previewRange = formatScoreRange(
    typeof watchedMin === "number" ? watchedMin : null,
    typeof watchedMax === "number" ? watchedMax : null,
  );

  const onSubmit = async (values: GradeFormValues) => {
    await onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Award className="size-5" />
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Standar Penilaian" : "Tambah Standar Penilaian"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? "Perbarui rentang nilai minimum, maksimum, atau rubrik predikat ini."
              : "Tentukan nama predikat, rentang skor (minimum & maksimum), dan rubrik capaian."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Live Preview Card */}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <Sparkles className="size-3.5 text-blue-500" />
              Pratinjau Tampilan Skala
            </div>
            <div className={`flex items-center justify-between rounded-lg border p-2.5 ${previewTheme.bg} ${previewTheme.border}`}>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${previewTheme.bg} ${previewTheme.text} ${previewTheme.border}`}>
                  <span className={`size-1.5 rounded-full ${previewTheme.dot}`} />
                  {watchedGrade}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {previewRange}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {watchedDesc || "Tanpa keterangan"}
              </span>
            </div>
          </div>

          {/* Grade Name */}
          <div className="space-y-1.5">
            <Label htmlFor="grade" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Predikat / Huruf Mutu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="grade"
              placeholder="Contoh: A, B+, C, Lulus"
              {...register("grade")}
              className={`h-9 text-xs sm:text-sm ${errors.grade ? "border-red-500" : ""}`}
            />
            {errors.grade && (
              <p className="text-[11px] font-medium text-red-500">{errors.grade.message}</p>
            )}
          </div>

          {/* Score Ranges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="minimumScore" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Skor Minimum (0–100)
              </Label>
              <Input
                id="minimumScore"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
                {...register("minimumScore")}
                className={`h-9 text-xs sm:text-sm ${errors.minimumScore ? "border-red-500" : ""}`}
              />
              {errors.minimumScore && (
                <p className="text-[11px] font-medium text-red-500">{errors.minimumScore.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maximumScore" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Skor Maksimum (0–100)
              </Label>
              <Input
                id="maximumScore"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="100.00"
                {...register("maximumScore")}
                className={`h-9 text-xs sm:text-sm ${errors.maximumScore ? "border-red-500" : ""}`}
              />
              {errors.maximumScore && (
                <p className="text-[11px] font-medium text-red-500">{errors.maximumScore.message}</p>
              )}
            </div>
          </div>

          {/* Description / Rubric */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Keterangan / Rubrik Capaian
            </Label>
            <Input
              id="description"
              placeholder="Contoh: Sangat Baik / Istimewa, Memuaskan, Remedial"
              {...register("description")}
              className={`h-9 text-xs sm:text-sm ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && (
              <p className="text-[11px] font-medium text-red-500">{errors.description.message}</p>
            )}
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="size-3" /> Penjelasan kualitatif predikat untuk panduan guru dan siswa.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
              {isSaving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Standar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
