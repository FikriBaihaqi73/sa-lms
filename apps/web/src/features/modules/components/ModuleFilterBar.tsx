import { RotateCcw, Search } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ClassSubjectOption } from "../types";

interface ModuleFilterBarProps {
  search: string;
  classSubjectId: string;
  isPublished: string;
  isLocked: string;
  classSubjectOptions: ClassSubjectOption[];
  onSearchChange: (value: string) => void;
  onClassSubjectChange: (value: string) => void;
  onPublishedChange: (value: string) => void;
  onLockedChange: (value: string) => void;
  onReset: () => void;
}

export const ModuleFilterBar: React.FC<ModuleFilterBarProps> = ({
  search,
  classSubjectId,
  isPublished,
  isLocked,
  classSubjectOptions,
  onSearchChange,
  onClassSubjectChange,
  onPublishedChange,
  onLockedChange,
  onReset,
}) => {
  const hasActiveFilters =
    search.trim() !== "" ||
    classSubjectId !== "" ||
    isPublished !== "" ||
    isLocked !== "";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari judul modul atau materi pembelajaran..."
          className="h-10 pl-9 text-xs sm:text-sm"
          aria-label="Cari modul"
        />
      </div>

      {/* Class Subject Filter */}
      <div className="w-full sm:w-60">
        <Select
          value={classSubjectId}
          onChange={(e) => onClassSubjectChange(e.target.value)}
          className="h-10 text-xs sm:text-sm"
          aria-label="Filter Mata Pelajaran Kelas"
        >
          <option value="">Semua Mapel Kelas</option>
          {classSubjectOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Status Publikasi Filter */}
      <div className="w-full sm:w-44">
        <Select
          value={isPublished}
          onChange={(e) => onPublishedChange(e.target.value)}
          className="h-10 text-xs sm:text-sm"
          aria-label="Filter Status Publikasi"
        >
          <option value="">Semua Publikasi</option>
          <option value="true">Diterbitkan</option>
          <option value="false">Draf</option>
        </Select>
      </div>

      {/* Status Kunci Filter */}
      <div className="w-full sm:w-40">
        <Select
          value={isLocked}
          onChange={(e) => onLockedChange(e.target.value)}
          className="h-10 text-xs sm:text-sm"
          aria-label="Filter Status Kunci"
        >
          <option value="">Semua Akses</option>
          <option value="false">Terbuka</option>
          <option value="true">Terkunci</option>
        </Select>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-10 shrink-0 gap-1.5 px-3 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          aria-label="Reset filter"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
};

