import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Link as LinkIcon,
  Lock,
  Plus,
  Trash2,
  Unlock,
  Video,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LearningModule, ModuleContent } from "../types";

interface ModuleCardProps {
  module: LearningModule;
  onEditModule: (module: LearningModule) => void;
  onDeleteModule: (module: LearningModule) => void;
  onTogglePublish: (module: LearningModule) => void;
  onToggleLock: (module: LearningModule) => void;
  onAddContent: (module: LearningModule) => void;
  onEditContent: (content: ModuleContent, module: LearningModule) => void;
  onDeleteContent: (content: ModuleContent, module: LearningModule) => void;
}

function getContentTypeBadge(type: string) {
  const normalized = type.toLowerCase();
  switch (normalized) {
    case "video":
      return {
        label: "Video",
        icon: Video,
        className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50",
      };
    case "pdf":
      return {
        label: "PDF",
        icon: FileText,
        className: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50",
      };
    case "link":
      return {
        label: "Tautan",
        icon: LinkIcon,
        className: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50",
      };
    default:
      return {
        label: "Teks / Dokumen",
        icon: FileText,
        className: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      };
  }
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onEditModule,
  onDeleteModule,
  onTogglePublish,
  onToggleLock,
  onAddContent,
  onEditContent,
  onDeleteContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contents = module.moduleContents || [];
  const subjectName = module.class_subject?.subject?.name;
  const className = module.class_subject?.class?.name;
  const classSubjectDisplay =
    subjectName && className
      ? `${subjectName} • ${className}`
      : "Mata Pelajaran Kelas";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      {/* Module Header Bar */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60"
            aria-label={isExpanded ? "Tutup detail modul" : "Buka detail modul"}
          >
            {isExpanded ? (
              <ChevronUp className="size-5" />
            ) : (
              <ChevronDown className="size-5" />
            )}
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                Urutan #{module.display_order ?? "-"}
              </span>

              <span className="rounded-md border border-blue-100 bg-blue-50/80 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                {classSubjectDisplay}
              </span>

              {module.is_published ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Diterbitkan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  Draf
                </span>
              )}

              {module.is_locked ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <Lock className="size-3" />
                  Terkunci
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                  <Unlock className="size-3" />
                  Terbuka
                </span>
              )}
            </div>

            <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
              {module.title}
            </h3>

            {module.description && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                {module.description}
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-blue-500" />
                {contents.length} Konten Pembelajaran
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-start">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAddContent(module)}
            className="h-8 gap-1.5 rounded-lg border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
            title="Tambah Konten Materi"
          >
            <Plus className="size-3.5" />
            <span>Konten</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onTogglePublish(module)}
            className="h-8 px-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            title={module.is_published ? "Tarik ke Draf" : "Publikasikan Modul"}
            aria-label={module.is_published ? "Tarik ke Draf" : "Publikasikan Modul"}
          >
            {module.is_published ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onToggleLock(module)}
            className="h-8 px-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            title={module.is_locked ? "Buka Kunci Modul" : "Kunci Modul"}
            aria-label={module.is_locked ? "Buka Kunci Modul" : "Kunci Modul"}
          >
            {module.is_locked ? (
              <Unlock className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEditModule(module)}
            className="h-8 px-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            title="Edit Modul"
            aria-label="Edit Modul"
          >
            <Edit2 className="size-3.5" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDeleteModule(module)}
            className="h-8 px-2 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
            title="Hapus Modul"
            aria-label="Hapus Modul"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Expandable Module Contents Section */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800/80 dark:bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daftar Konten / Materi Pembelajaran ({contents.length})
            </h4>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAddContent(module)}
              className="h-7 gap-1 rounded-md text-[11px] font-semibold text-blue-600 dark:text-blue-400"
            >
              <Plus className="size-3" />
              <span>Tambah Konten</span>
            </Button>
          </div>

          {contents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <FileText className="mx-auto size-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Belum ada konten materi pada modul ini
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                Tambahkan materi bacaan, video panduan, slide PDF, atau tautan tugas pembelajaran.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => onAddContent(module)}
                className="mt-3 h-8 gap-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="size-3.5" />
                <span>Tambah Konten Pertama</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {contents.map((item) => {
                const badge = getContentTypeBadge(item.contentType);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-mono font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.sortOrder ?? "-"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                          >
                            <BadgeIcon className="size-3" />
                            {badge.label}
                          </span>
                          <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 sm:text-sm">
                            {item.title}
                          </span>
                        </div>

                        {item.content && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditContent(item, module)}
                        className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        title="Edit Konten"
                        aria-label="Edit Konten"
                      >
                        <Edit2 className="size-3.5" />
                        <span className="ml-1 hidden sm:inline">Ubah</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteContent(item, module)}
                        className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                        title="Hapus Konten"
                        aria-label="Hapus Konten"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="ml-1 hidden sm:inline">Hapus</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

