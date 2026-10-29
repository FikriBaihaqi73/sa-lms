import { GitFork } from "lucide-react";
import type { Subject } from "../types";

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  hasDraftEdits?: boolean;
  onSelect: (id: string) => void;
}

export function SubjectCard({
  subject,
  isSelected,
  hasDraftEdits = false,
  onSelect,
}: SubjectCardProps) {
  const prerequisiteCount = subject.prerequisiteIds.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(subject.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(subject.id);
        }
      }}
      className={`group relative text-left p-4 rounded-md border transition-all cursor-pointer ${
        isSelected
          ? "border-neutral-900 dark:border-neutral-100 bg-white dark:bg-neutral-800/80 border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-sm ring-1 ring-blue-500/10"
          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40"
      }`}
    >
      {/* Top Header: Code badge, SKS/Semester & Prerequisite Count Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700">
            {subject.code}
          </span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            {subject.credits} SKS{subject.semester ? ` • Sem. ${subject.semester}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasDraftEdits && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              Diedit
            </span>
          )}

          {/* Badge / Ikon kecil info jumlah prasyarat */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium border ${
              prerequisiteCount > 0
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60"
                : "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
            }`}
          >
            <GitFork className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              {prerequisiteCount} {prerequisiteCount === 1 ? "Prasyarat" : "Prasyarat"}
            </span>
          </span>
        </div>
      </div>

      {/* Course Name */}
      <h3 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight line-clamp-1">
        {subject.name}
      </h3>

      {/* Meta Department */}
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span className="truncate">{subject.department}</span>
        <span className="text-[11px] text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Lihat Detail &rarr;
        </span>
      </div>
    </div>
  );
}

