import { Badge } from "@/components/ui/badge";
import type { TeacherClassAssignment } from "../types";

export function TeacherAssignmentPills({
  assignments,
  isLoading,
}: {
  assignments: TeacherClassAssignment[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Memuat penugasan...</p>;
  }

  if (assignments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Guru ini belum memiliki penugasan kelas.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {assignments.map((assignment) => (
        <Badge
          key={assignment.id}
          variant="secondary"
          className="px-2.5 py-1 text-xs font-semibold"
          title={`${assignment.class?.name ?? "-"} · ${assignment.subject?.name ?? "-"}`}
        >
          {assignment.class?.name ?? "-"} · {assignment.subject?.name ?? "-"}
        </Badge>
      ))}
    </div>
  );
}
