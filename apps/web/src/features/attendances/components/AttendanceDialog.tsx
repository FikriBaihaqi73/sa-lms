import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSchedules } from "@/features/schedules/hooks/useSchedules";
import { useStudents } from "@/features/students/hooks/useStudents";
import { useAttendanceStatuses } from "@/features/attendance-statuses/hooks/useAttendanceStatuses";
import {
  attendanceFormSchema,
  type AttendanceFormValues,
} from "../schemas/attendanceSchema";
import type { Attendance, CreateAttendanceInput } from "../types";

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAttendanceInput) => Promise<void>;
  initialData?: Attendance | null;
  isSubmitting?: boolean;
}

function toDateInputValue(isoOrDateStr?: string | null): string {
  if (!isoOrDateStr) {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }
  const d = new Date(isoOrDateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export const AttendanceDialog: React.FC<AttendanceDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const isEditMode = Boolean(initialData);

  const schedulesQuery = useSchedules({ page: 1, limit: 100 });
  const studentsQuery = useStudents({ page: 1, limit: 100 });
  const statusesQuery = useAttendanceStatuses({ page: 1, limit: 100 });

  const schedules = schedulesQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];
  const statuses = statusesQuery.data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      schedule_id: "",
      student_id: "",
      attendance_status_id: "",
      attendance_date: toDateInputValue(),
      notes: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      reset({
        schedule_id: initialData.schedule_id,
        student_id: initialData.student_id,
        attendance_status_id: initialData.attendance_status_id,
        attendance_date: toDateInputValue(initialData.attendance_date),
        notes: initialData.notes || "",
      });
    } else {
      reset({
        schedule_id: "",
        student_id: "",
        attendance_status_id: "",
        attendance_date: toDateInputValue(),
        notes: "",
      });
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = async (values: AttendanceFormValues) => {
    // Format date as ISO string for backend z.string().datetime()
    const isoDate = values.attendance_date
      ? new Date(`${values.attendance_date}T00:00:00.000Z`).toISOString()
      : undefined;

    await onSubmit({
      schedule_id: values.schedule_id,
      student_id: values.student_id,
      attendance_status_id: values.attendance_status_id,
      attendance_date: isoDate,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Ubah Presensi Siswa" : "Catat Presensi Siswa"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Perbarui catatan presensi siswa untuk jadwal terkait."
              : "Isi data presensi siswa berdasarkan jadwal dan status kehadiran."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          {/* Jadwal Pelajaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Jadwal Pelajaran <span className="text-red-500">*</span>
            </label>
            <select
              {...register("schedule_id")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Pilih Jadwal Pelajaran</option>
              {schedules.map((sch) => {
                const day = sch.day;
                const className = sch.classSubject?.class?.name ?? "Kelas";
                const subject = sch.classSubject?.subject?.name ?? "Mapel";
                const time =
                  sch.startTime && sch.endTime
                    ? `(${sch.startTime} - ${sch.endTime})`
                    : "";
                return (
                  <option key={sch.id} value={sch.id}>
                    {day} • {className} - {subject} {time}
                  </option>
                );
              })}
            </select>
            {errors.schedule_id && (
              <p className="text-xs text-red-500">{errors.schedule_id.message}</p>
            )}
          </div>

          {/* Siswa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Siswa <span className="text-red-500">*</span>
            </label>
            <select
              {...register("student_id")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Pilih Siswa</option>
              {students.map((st) => {
                const name = st.profile?.fullName ?? "Siswa";
                const nisn = st.studentNumber ? `(NISN: ${st.studentNumber})` : "";
                return (
                  <option key={st.id} value={st.id}>
                    {name} {nisn}
                  </option>
                );
              })}
            </select>
            {errors.student_id && (
              <p className="text-xs text-red-500">{errors.student_id.message}</p>
            )}
          </div>

          {/* Status Kehadiran */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Status Kehadiran <span className="text-red-500">*</span>
            </label>
            <select
              {...register("attendance_status_id")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Pilih Status Kehadiran</option>
              {statuses.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.description ? `— ${st.description}` : ""}
                </option>
              ))}
            </select>
            {errors.attendance_status_id && (
              <p className="text-xs text-red-500">
                {errors.attendance_status_id.message}
              </p>
            )}
          </div>

          {/* Tanggal Kehadiran */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Tanggal Kehadiran <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("attendance_date")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.attendance_date && (
              <p className="text-xs text-red-500">{errors.attendance_date.message}</p>
            )}
          </div>

          {/* Catatan / Keterangan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Catatan / Keterangan (Opsional)
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Contoh: Izin acara keluarga / Sakit demam berdarah"
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.notes && (
              <p className="text-xs text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Simpan Presensi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
