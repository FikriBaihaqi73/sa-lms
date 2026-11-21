import { Megaphone, Plus } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface AnnouncementsHeaderProps {
  onAddAnnouncement: () => void;
}

export const AnnouncementsHeader: React.FC<AnnouncementsHeaderProps> = ({
  onAddAnnouncement,
}) => {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <Megaphone className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            Pengumuman Institusi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Kelola pengumuman resmi, target penerima (Semua, Guru, Siswa), dan status publikasi institusi.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          onClick={onAddAnnouncement}
          className="h-9 gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          <span>Tambah Pengumuman</span>
        </Button>
      </div>
    </header>
  );
};
