import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SCHEDULE_DAYS,
  scheduleFormSchema,
  type ScheduleFormValues,
} from "../schemas/scheduleSchema";
import type { Schedule, ScheduleOptions } from "../types";
import { formatTimeDisplay } from "../utils";

interface ScheduleDialogProps {
  open: boolean;
  item: Schedule | null;
  options?: ScheduleOptions;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: ScheduleFormValues) => Promise<void>;
}

export function ScheduleDialog({
  open,
  item,
  options,
  isSaving,
  onClose,
  onSave,
}: ScheduleDialogProps) {
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      day: "Senin",
      classSubjectId: "",
      classroomId: "",
      startTime: "",
      endTime: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          day: item.day,
          classSubjectId: item.classSubjectId,
          classroomId: item.classroomId,
          startTime: item.startTime ? formatTimeDisplay(item.startTime) : "",
          endTime: item.endTime ? formatTimeDisplay(item.endTime) : "",
        });
      } else {
        reset({
          day: "Senin",
          classSubjectId: "",
          classroomId: "",
          startTime: "",
          endTime: "",
        });
      }
    }
  }, [open, item, reset]);

  if (!open) return null;

  const onSubmit = async (values: ScheduleFormValues) => {
    await onSave(values);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Ubah Jadwal Pelajaran" : "Tambah Jadwal Pelajaran"}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEdit ? "Ubah Jadwal Pelajaran" : "Tambah Jadwal Pelajaran"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isEdit
                ? "Perbarui alokasi waktu, kelas, atau ruangan jadwal."
                : "Tentukan hari, mata pelajaran kelas, dan ruangan untuk jadwal baru."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          {/* Hari */}
          <div>
            <label
              htmlFor="day"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Hari Pelaksanaan <span className="text-red-500">*</span>
            </label>
            <Select id="day" {...register("day")} className="h-10 text-sm">
              {SCHEDULE_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Select>
            {errors.day && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.day.message}
              </p>
            )}
          </div>

          {/* Mata Pelajaran Kelas */}
          <div>
            <label
              htmlFor="classSubjectId"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Mata Pelajaran & Kelas <span className="text-red-500">*</span>
            </label>
            <Select
              id="classSubjectId"
              {...register("classSubjectId")}
              className="h-10 text-sm"
            >
              <option value="">-- Pilih Mata Pelajaran Kelas --</option>
              {options?.classSubjects.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </Select>
            {errors.classSubjectId && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.classSubjectId.message}
              </p>
            )}
          </div>

          {/* Ruangan */}
          <div>
            <label
              htmlFor="classroomId"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Ruangan Kelas <span className="text-red-500">*</span>
            </label>
            <Select
              id="classroomId"
              {...register("classroomId")}
              className="h-10 text-sm"
            >
              <option value="">-- Pilih Ruangan Kelas --</option>
              {options?.classrooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomName} ({room.roomCode})
                  {room.building ? ` — ${room.building}` : ""}
                  {room.capacity ? ` (Kapasitas: ${room.capacity})` : ""}
                </option>
              ))}
            </Select>
            {errors.classroomId && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.classroomId.message}
              </p>
            )}
          </div>

          {/* Jam Mulai & Jam Selesai */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Jam Mulai (WIB)
              </label>
              <div className="relative">
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                  className="h-10 text-sm"
                />
                <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Jam Selesai (WIB)
              </label>
              <div className="relative">
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                  className="h-10 text-sm"
                />
                <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 text-sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Jadwal"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
