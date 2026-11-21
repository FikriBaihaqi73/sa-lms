import { AlertCircle, Users } from "lucide-react";
import type { AnnouncementCategory, TargetAudience } from "../types";

export function TargetAudienceBadge({
  audience,
}: {
  audience?: TargetAudience;
}) {
  switch (audience) {
    case "TEACHER":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Users className="size-3" />
          Khusus Guru
        </span>
      );
    case "STUDENT":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
          <Users className="size-3" />
          Khusus Siswa
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
          <Users className="size-3" />
          Semua Pengguna
        </span>
      );
  }
}

export function CategoryBadge({
  category,
}: {
  category?: AnnouncementCategory;
}) {
  switch (category) {
    case "ACADEMIC":
      return (
        <span className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
          Akademik
        </span>
      );
    case "EVENT":
      return (
        <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
          Kegiatan
        </span>
      );
    case "IMPORTANT":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="size-3" />
          Penting
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
          Umum
        </span>
      );
  }
}

export function PublicationStatusBadge({
  isPublished,
}: {
  isPublished: boolean;
}) {
  if (isPublished) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Diterbitkan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Draf
    </span>
  );
}
