import { RotateCcw, Search } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface AnnouncementsFilterProps {
  search: string;
  isPublished: string;
  targetAudience: string;
  category: string;
  onSearchChange: (value: string) => void;
  onPublishedChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}

export const AnnouncementsFilter: React.FC<AnnouncementsFilterProps> = ({
  search,
  isPublished,
  targetAudience,
  category,
  onSearchChange,
  onPublishedChange,
  onTargetAudienceChange,
  onCategoryChange,
  onReset,
}) => {
  const hasActiveFilters =
    search.trim() !== "" ||
    isPublished !== "" ||
    targetAudience !== "" ||
    category !== "";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul atau isi pengumuman..."
            className="h-9 pl-9 text-xs sm:text-sm"
            aria-label="Cari pengumuman"
          />
        </div>

        {/* Status Publikasi */}
        <div>
          <Select
            value={isPublished}
            onChange={(e) => onPublishedChange(e.target.value)}
            className="h-9 text-xs"
            aria-label="Filter Status Publikasi"
          >
            <option value="">Semua Status</option>
            <option value="true">Diterbitkan (Published)</option>
            <option value="false">Draf (Draft)</option>
          </Select>
        </div>

        {/* Target Audiens */}
        <div>
          <Select
            value={targetAudience}
            onChange={(e) => onTargetAudienceChange(e.target.value)}
            className="h-9 text-xs"
            aria-label="Filter Target Audiens"
          >
            <option value="">Semua Target</option>
            <option value="ALL">Semua Pengguna</option>
            <option value="TEACHER">Khusus Guru</option>
            <option value="STUDENT">Khusus Siswa</option>
          </Select>
        </div>

        {/* Kategori */}
        <div>
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 text-xs"
            aria-label="Filter Kategori"
          >
            <option value="">Semua Kategori</option>
            <option value="GENERAL">Umum</option>
            <option value="ACADEMIC">Akademik</option>
            <option value="EVENT">Kegiatan / Event</option>
            <option value="IMPORTANT">Penting / Mendesak</option>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1.5 px-3 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            aria-label="Reset filter"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Filter</span>
          </Button>
        </div>
      )}
    </div>
  );
};
