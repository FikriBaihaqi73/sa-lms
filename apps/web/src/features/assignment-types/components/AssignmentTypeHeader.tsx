import { Plus, BookOpen } from "lucide-react";

interface AssignmentTypeHeaderProps {
  onAdd: () => void;
}

export function AssignmentTypeHeader({ onAdd }: AssignmentTypeHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
            Tipe Tugas (Assignment Types)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Kelola kategori dan tipe penugasan pembelajaran di institusi pendidikan
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Plus className="h-4 w-4" />
        Tambah Tipe Tugas
      </button>
    </div>
  );
}
