import { BookOpen, Plus } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface ModulesPageHeaderProps {
  onAddModule: () => void;
}

export const ModulesPageHeader: React.FC<ModulesPageHeaderProps> = ({
  onAddModule,
}) => {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <BookOpen className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            Modul & Konten Pembelajaran
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Kelola materi modul, bahan ajar, dan urutan konten pembelajaran per mata pelajaran kelas.
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={onAddModule}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:text-sm"
      >
        <Plus className="size-4" />
        <span>Tambah Modul</span>
      </Button>
    </header>
  );
};

