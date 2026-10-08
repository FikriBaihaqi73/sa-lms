import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teacherDisplayName, teacherEmail } from "./TeachersTable";
import { TeacherAssignmentPills } from "./TeacherAssignmentPills";
import type { Teacher, TeacherClassAssignment } from "../types";
import type { TeacherFormValues } from "../schemas/teacherSchema";

interface EditTeacherSheetProps {
  open: boolean;
  teacher: Teacher | null;
  assignments: TeacherClassAssignment[];
  assignmentsLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: TeacherFormValues) => Promise<void>;
}

export function EditTeacherSheetHeader({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const name = teacherDisplayName(teacher);
  const email = teacherEmail(teacher);
  return (
    <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{name}</h2>
          {email && <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>}
          <p className="mt-0.5 font-mono text-xs text-slate-400">{teacher.teacher_number}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Tutup panel"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

export function EditTeacherSheetBody({ teacher, assignments, assignmentsLoading }: { teacher: Teacher; assignments: TeacherClassAssignment[]; assignmentsLoading: boolean }) {
  const name = teacherDisplayName(teacher);
  const email = teacherEmail(teacher);
  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Data pribadi</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Nama lengkap</dt>
            <dd className="text-right font-medium text-slate-900 dark:text-slate-100">{name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">NIP</dt>
            <dd className="font-mono text-slate-900 dark:text-slate-100">{teacher.teacher_number}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="text-right text-slate-900 dark:text-slate-100">{email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Telepon</dt>
            <dd className="text-right text-slate-900 dark:text-slate-100">
              {teacher.profile?.phoneNumber ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kepegawaian</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Status</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {teacher.employment_status?.name ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Spesialisasi</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {teacher.specialization?.name ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kelas yang diampu</h3>
        <div className="mt-3">
          <TeacherAssignmentPills assignments={assignments} isLoading={assignmentsLoading} />
        </div>
      </section>
    </div>
  );
}



export function EditTeacherSheet({ open, teacher, assignments, assignmentsLoading, isSaving, onClose, onSave }: EditTeacherSheetProps) {
  if (!open || !teacher) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50" role="presentation" onMouseDown={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Ubah guru"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <EditTeacherSheetHeader teacher={teacher} onClose={onClose} />
        <EditTeacherSheetBody teacher={teacher} assignments={assignments} assignmentsLoading={assignmentsLoading} />
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-4 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={() =>
              onSave({
                profile_id: teacher.profile_id,
                teacher_number: teacher.teacher_number,
                specialization_id: teacher.specialization_id ?? "",
                employment_status_id: teacher.employment_status_id ?? "",
                join_date: teacher.join_date ? teacher.join_date.slice(0, 10) : "",
              })
            }
            className="bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSaving ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
