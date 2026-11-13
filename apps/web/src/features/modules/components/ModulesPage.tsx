import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useClassSubjectOptions,
  useCreateModule,
  useCreateModuleContent,
  useDeleteModule,
  useDeleteModuleContent,
  useModuleStats,
  useModules,
  useUpdateModule,
  useUpdateModuleContent,
} from "../hooks/useModules";
import type {
  ModuleContentFormValues,
  ModuleFormValues,
} from "../schemas/moduleSchema";
import type { LearningModule, ModuleContent } from "../types";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ModuleCard } from "./ModuleCard";
import { ModuleContentDialog } from "./ModuleContentDialog";
import { ModuleDialog } from "./ModuleDialog";
import { ModuleFilterBar } from "./ModuleFilterBar";
import { ModuleStatsCards } from "./ModuleStatsCards";
import { ModulesPageHeader } from "./ModulesPageHeader";

export const ModulesPage: React.FC = () => {
  // Filters and Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [classSubjectId, setClassSubjectId] = useState("");
  const [isPublished, setIsPublished] = useState("");
  const [isLocked, setIsLocked] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentParentModule, setContentParentModule] =
    useState<LearningModule | null>(null);
  const [editingContent, setEditingContent] = useState<ModuleContent | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "module"; module: LearningModule }
    | { type: "content"; content: ModuleContent; parentModule: LearningModule }
    | null
  >(null);

  // Queries
  const modulesQuery = useModules({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    class_subject_id: classSubjectId || undefined,
    is_published: isPublished || undefined,
    is_locked: isLocked || undefined,
  });

  const classSubjectOptionsQuery = useClassSubjectOptions();

  // Mutations
  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();

  const createContentMutation = useCreateModuleContent();
  const updateContentMutation = useUpdateModuleContent();
  const deleteContentMutation = useDeleteModuleContent();

  const modulesList = modulesQuery.data?.data || [];
  const meta = modulesQuery.data?.meta;
  const totalPages = Math.max(meta?.totalPages || 1, 1);
  const stats = useModuleStats(modulesList);

  // Handlers for Module CRUD
  const handleOpenCreateModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: LearningModule) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (values: ModuleFormValues) => {
    try {
      if (editingModule) {
        await updateModuleMutation.mutateAsync({
          id: editingModule.id,
          data: {
            title: values.title,
            class_subject_id: values.class_subject_id,
            description: values.description ?? null,
            display_order: values.display_order ?? null,
            is_published: values.is_published,
            is_locked: values.is_locked,
          },
        });
        toast.success("Modul berhasil diperbarui.");
      } else {
        await createModuleMutation.mutateAsync({
          title: values.title,
          class_subject_id: values.class_subject_id,
          description: values.description ?? null,
          display_order: values.display_order ?? null,
          is_published: values.is_published,
          is_locked: values.is_locked,
        });
        toast.success("Modul berhasil dibuat.");
      }
      setIsModuleModalOpen(false);
      setEditingModule(null);
      await modulesQuery.refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan modul.";
      toast.error(msg);
    }
  };

  const handleTogglePublish = async (mod: LearningModule) => {
    try {
      const nextStatus = !mod.is_published;
      await updateModuleMutation.mutateAsync({
        id: mod.id,
        data: { is_published: nextStatus },
      });
      toast.success(
        nextStatus
          ? "Modul berhasil diterbitkan untuk siswa."
          : "Modul dialihkan kembali ke draf.",
      );
      await modulesQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status publikasi.";
      toast.error(msg);
    }
  };

  const handleToggleLock = async (mod: LearningModule) => {
    try {
      const nextLock = !mod.is_locked;
      await updateModuleMutation.mutateAsync({
        id: mod.id,
        data: { is_locked: nextLock },
      });
      toast.success(
        nextLock ? "Akses modul dikunci." : "Kunci modul dibuka.",
      );
      await modulesQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui status kunci.";
      toast.error(msg);
    }
  };

  // Handlers for Module Content CRUD
  const handleOpenAddContent = (mod: LearningModule) => {
    setContentParentModule(mod);
    setEditingContent(null);
    setIsContentModalOpen(true);
  };

  const handleOpenEditContent = (
    content: ModuleContent,
    mod: LearningModule,
  ) => {
    setContentParentModule(mod);
    setEditingContent(content);
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async (values: ModuleContentFormValues) => {
    if (!contentParentModule) return;
    try {
      if (editingContent) {
        await updateContentMutation.mutateAsync({
          id: editingContent.id,
          data: {
            title: values.title,
            contentType: values.contentType,
            content: values.content ?? null,
            sortOrder: values.sortOrder ?? null,
          },
        });
        toast.success("Konten materi berhasil diperbarui.");
      } else {
        await createContentMutation.mutateAsync({
          moduleId: contentParentModule.id,
          title: values.title,
          contentType: values.contentType,
          content: values.content ?? null,
          sortOrder: values.sortOrder ?? null,
        });
        toast.success("Konten materi baru berhasil ditambahkan.");
      }
      setIsContentModalOpen(false);
      setContentParentModule(null);
      setEditingContent(null);
      await modulesQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan konten materi.";
      toast.error(msg);
    }
  };

  // Delete Handlers
  const handleOpenDeleteModule = (mod: LearningModule) => {
    setDeleteTarget({ type: "module", module: mod });
  };

  const handleOpenDeleteContent = (
    content: ModuleContent,
    mod: LearningModule,
  ) => {
    setDeleteTarget({ type: "content", content, parentModule: mod });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "module") {
        await deleteModuleMutation.mutateAsync(deleteTarget.module.id);
        toast.success("Modul berhasil dihapus.");
      } else {
        await deleteContentMutation.mutateAsync(deleteTarget.content.id);
        toast.success("Konten materi berhasil dihapus.");
      }
      setDeleteTarget(null);
      await modulesQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus data.";
      toast.error(msg);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setClassSubjectId("");
    setIsPublished("");
    setIsLocked("");
    setPage(1);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <ModulesPageHeader onAddModule={handleOpenCreateModule} />

        {/* 4 Stats Cards */}
        <ModuleStatsCards
          stats={stats}
          isLoading={modulesQuery.isPending}
        />

        {/* Filter Bar */}
        <ModuleFilterBar
          search={searchTerm}
          classSubjectId={classSubjectId}
          isPublished={isPublished}
          isLocked={isLocked}
          classSubjectOptions={classSubjectOptionsQuery.data || []}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          onClassSubjectChange={(val) => {
            setClassSubjectId(val);
            setPage(1);
          }}
          onPublishedChange={(val) => {
            setIsPublished(val);
            setPage(1);
          }}
          onLockedChange={(val) => {
            setIsLocked(val);
            setPage(1);
          }}
          onReset={handleResetFilters}
        />

        {/* Modules List / Empty State */}
        {modulesQuery.isPending ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-center">
              <div className="inline-block size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Memuat daftar modul dan materi...
              </p>
            </div>
          </div>
        ) : modulesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <BookOpen className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
              Belum ada modul pembelajaran
            </h3>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Mulai atur kurikulum dan materi pembelajaran dengan membuat modul baru untuk mata pelajaran kelas.
            </p>
            <Button
              type="button"
              onClick={handleOpenCreateModule}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
            >
              <Plus className="size-4" />
              <span>Buat Modul Pertama</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {modulesList.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                onEditModule={handleOpenEditModule}
                onDeleteModule={handleOpenDeleteModule}
                onTogglePublish={handleTogglePublish}
                onToggleLock={handleToggleLock}
                onAddContent={handleOpenAddContent}
                onEditContent={handleOpenEditContent}
                onDeleteContent={handleOpenDeleteContent}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Halaman <span className="font-semibold">{page}</span> dari{" "}
                  <span className="font-semibold">{totalPages}</span> (Total{" "}
                  {meta?.totalData ?? modulesList.length} modul)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="h-8 gap-1 px-3 text-xs"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>Sebelumnya</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="h-8 gap-1 px-3 text-xs"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Module Create/Edit Dialog */}
      <ModuleDialog
        open={isModuleModalOpen}
        module={editingModule}
        classSubjectOptions={classSubjectOptionsQuery.data || []}
        isSaving={
          createModuleMutation.isPending || updateModuleMutation.isPending
        }
        onClose={() => {
          setIsModuleModalOpen(false);
          setEditingModule(null);
        }}
        onSave={handleSaveModule}
      />

      {/* Module Content Create/Edit Dialog */}
      <ModuleContentDialog
        open={isContentModalOpen}
        parentModule={contentParentModule}
        content={editingContent}
        isSaving={
          createContentMutation.isPending || updateContentMutation.isPending
        }
        onClose={() => {
          setIsContentModalOpen(false);
          setContentParentModule(null);
          setEditingContent(null);
        }}
        onSave={handleSaveContent}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === "module"
            ? "Hapus Modul Pembelajaran"
            : "Hapus Konten Materi"
        }
        description={
          deleteTarget?.type === "module"
            ? `Apakah Anda yakin ingin menghapus modul "${deleteTarget.module.title}" beserta seluruh materi di dalamnya? Tindakan ini dapat dibatalkan melalui pemulihan data sistem.`
            : `Apakah Anda yakin ingin menghapus materi "${deleteTarget?.content.title}" dari modul ini?`
        }
        isDeleting={
          deleteModuleMutation.isPending || deleteContentMutation.isPending
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
};

