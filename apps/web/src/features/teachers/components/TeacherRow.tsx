import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { teacherDisplayName, teacherEmail, teacherHasAccount, teacherClassCount } from "./TeachersTable";
import type { Teacher } from "../types";

function statusBadgeClass(statusName: string): string {
  const normalized = statusName.trim().toLowerCase();
  if (normalized.includes("tetap")) {
    return "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300";
  }
  return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return (parts[0] as string).slice(0, 2).toUpperCase();
  return `${(parts[0] as string).charAt(0)}${(parts[parts.length - 1] as string).charAt(0)}`.toUpperCase();
}

export function TeacherRow({
  teacher,
  onEdit,
  onDelete,
}: {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}) {
  const name = teacherDisplayName(teacher);
  const email = teacherEmail(teacher);
  const classCount = teacherClassCount(teacher);
  const hasAccount = teacherHasAccount(teacher);
  const canDelete = classCount === 0;

  return (
    <tr className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{name}</p>
            {email && (
              <p
                className={
                  hasAccount
                    ? "truncate text-xs text-slate-500 dark:text-slate-400"
                    : "truncate text-xs italic text-slate-400 dark:text-slate-500"
                }
              >
                {email}
              </p>
            )}
            {!hasAccount && (
              <Badge
                variant="outline"
                className="mt-1 border-amber-300 bg-amber-50 text-[11px] font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
              >
                Belum ada akun
              </Badge>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-4 font-mono text-[13px] text-slate-700 dark:text-slate-300">
        {teacher.teacher_number || "—"}
      </td>
      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
        {teacher.specialization?.name ?? "—"}
      </td>
      <td className="px-5 py-4">
        {teacher.employment_status?.name ? (
          <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(teacher.employment_status.name)}`}
          >
            {teacher.employment_status.name}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td
        className={`px-5 py-4 font-semibold tabular-nums ${classCount === 0 ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}
      >
        {classCount}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(teacher)}
            className="size-8 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            title="Ubah guru"
          >
            <Pencil className="size-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <span title={canDelete ? "Hapus guru" : "Guru masih mengampu kelas"}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canDelete}
              onClick={() => onDelete(teacher)}
              className="size-8 text-red-600 hover:text-red-700 disabled:text-slate-300 dark:text-red-400 dark:disabled:text-slate-600"
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </span>
        </div>
      </td>
    </tr>
  );
}
