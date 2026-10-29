import { BookOpen, X } from "lucide-react";
import type { Subject } from "../types";

interface PrerequisiteItemProps {
  subject: Subject;
  onRemove: (id: string) => void;
}

export function PrerequisiteItem({ subject, onRemove }: PrerequisiteItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs group">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 p-1.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shrink-0">
          <BookOpen className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700">
              {subject.code}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {subject.credits} SKS{subject.semester ? ` • Sem. ${subject.semester}` : ""}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {subject.name}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
            {subject.department}
          </p>
        </div>
      </div>

      {/* Tombol 'X' kecil untuk menghapus */}
      <button
        type="button"
        onClick={() => onRemove(subject.id)}
        title={`Hapus prasyarat ${subject.code}`}
        aria-label={`Hapus prasyarat ${subject.code}`}
        className="h-7 w-7 rounded-sm flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

