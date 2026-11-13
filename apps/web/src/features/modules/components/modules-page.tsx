import { BookOpen, Plus } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import {
	useClassSubjectOptions,
	useCreateModule,
	useDeleteModule,
	useModules,
	useUpdateModule,
} from "../hooks";
import type { ModuleFormValues } from "../schemas";
import type { ClassSubjectOption, LearningModule } from "../types";
import { ModuleDeleteDialog } from "./module-delete-dialog";
import { ModuleDetailDialog } from "./module-detail-dialog";
import { ModuleDialog } from "./module-dialog";
import { ModuleFilter } from "./module-filter";
import { ModuleStats } from "./module-stats";
import { ModuleTable } from "./module-table";

function parseErrorMessage(err: unknown): string {
	if (err instanceof ApiError) {
		if (err.status === 403) {
			return "Akses ditolak: Operasi modul pembelajaran dibatasi sesuai hak akses.";
		}
		if (err.status === 404) {
			return "Mapel kelas atau data modul tidak ditemukan.";
		}
		if (err.fieldErrors.length > 0) {
			return `${err.message}: ${err.fieldErrors
				.map(({ field, message }) => `${field || "input"} - ${message}`)
				.join("; ")}`;
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return "Terjadi kesalahan pada sistem. Silakan coba lagi.";
}

export const ModulesPage: React.FC = () => {
	// Filter States
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 400);
	const [classSubjectId, setClassSubjectId] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(10);

	// Dialog States
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingModule, setEditingModule] = useState<LearningModule | null>(
		null,
	);
	const [detailModule, setDetailModule] = useState<LearningModule | null>(null);
	const [deletingModule, setDeletingModule] =
		useState<LearningModule | null>(null);

	// Queries & Mutations
	const {
		data: modulesResponse,
		isLoading,
		isError,
		refetch,
	} = useModules({
		page: currentPage,
		limit: perPage,
		search: debouncedSearch.trim() || undefined,
		class_subject_id: classSubjectId || undefined,
	});

	const classSubjectOptionsQuery = useClassSubjectOptions();
	const classSubjectOptions = classSubjectOptionsQuery.data ?? [];

	const classSubjectMap = useMemo(() => {
		const map: Record<string, ClassSubjectOption> = {};
		for (const opt of classSubjectOptions) {
			map[opt.id] = opt;
		}
		return map;
	}, [classSubjectOptions]);

	const createMutation = useCreateModule();
	const updateMutation = useUpdateModule();
	const deleteMutation = useDeleteModule();

	const modules = modulesResponse?.data ?? [];
	const meta = modulesResponse?.meta ?? {
		totalData: 0,
		totalPages: 1,
		currentPage: 1,
		perPage: 10,
	};

	// Metrics Calculation
	const totalModules = meta.totalData;
	const publishedModules = modules.filter((m) => m.is_published).length;
	const lockedModules = modules.filter((m) => m.is_locked).length;
	const totalContents = modules.reduce(
		(sum, m) =>
			sum + (m.moduleContents?.length ?? 0) + (m.assignments?.length ?? 0),
		0,
	);

	// Handlers
	const handleOpenCreate = () => {
		setEditingModule(null);
		setIsDialogOpen(true);
	};

	const handleOpenEdit = (item: LearningModule) => {
		setEditingModule(item);
		setIsDialogOpen(true);
	};

	const handleOpenDetail = (item: LearningModule) => {
		setDetailModule(item);
	};

	const handleOpenDelete = (item: LearningModule) => {
		setDeletingModule(item);
	};

	const handleSubmitForm = async (values: ModuleFormValues) => {
		try {
			if (editingModule) {
				await updateMutation.mutateAsync({
					id: editingModule.id,
					data: {
						class_subject_id: values.class_subject_id,
						title: values.title,
						description: values.description || null,
						display_order: values.display_order ?? null,
						is_published: values.is_published,
						is_locked: values.is_locked,
					},
				});
				toast.success("Modul pembelajaran berhasil diperbarui!");
			} else {
				await createMutation.mutateAsync({
					class_subject_id: values.class_subject_id,
					title: values.title,
					description: values.description || null,
					display_order: values.display_order ?? null,
					is_published: values.is_published,
					is_locked: values.is_locked,
				});
				toast.success("Modul pembelajaran berhasil ditambahkan!");
			}
			setIsDialogOpen(false);
			setEditingModule(null);
		} catch (err) {
			toast.error(parseErrorMessage(err));
		}
	};

	const handleConfirmDelete = async () => {
		if (!deletingModule) return;
		try {
			await deleteMutation.mutateAsync(deletingModule.id);
			toast.success("Modul pembelajaran berhasil dihapus!");
			setDeletingModule(null);
		} catch (err) {
			toast.error(parseErrorMessage(err));
		}
	};

	const handleResetFilters = () => {
		setSearch("");
		setClassSubjectId("");
		setCurrentPage(1);
	};

	return (
		<main className="min-h-screen bg-slate-50/50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* Header Section */}
				<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<div className="flex items-center gap-2">
							<span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md">
								<BookOpen className="size-5" />
							</span>
							<div>
								<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
									Modul Pembelajaran
								</h1>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Kelola silabus topik pembelajaran, urutan materi, dan status akses LMS institusi.
								</p>
							</div>
						</div>
					</div>

					<Button
						type="button"
						onClick={handleOpenCreate}
						className="gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 font-semibold text-white shadow-md hover:from-blue-800 hover:to-indigo-700"
					>
						<Plus className="size-4" />
						Tambah Modul
					</Button>
				</header>

				{/* 4 Kartu Metrik Ringkasan */}
				<ModuleStats
					totalModules={totalModules}
					publishedModules={publishedModules}
					lockedModules={lockedModules}
					totalContents={totalContents}
					isLoading={isLoading}
				/>

				{/* Filter Bar */}
				<ModuleFilter
					search={search}
					onSearchChange={(val) => {
						setSearch(val);
						setCurrentPage(1);
					}}
					classSubjectId={classSubjectId}
					onClassSubjectChange={(val) => {
						setClassSubjectId(val);
						setCurrentPage(1);
					}}
					classSubjectOptions={classSubjectOptions}
					onReset={handleResetFilters}
				/>

				{/* Data Table */}
				<ModuleTable
					rows={modules}
					totalData={meta.totalData}
					currentPage={currentPage}
					totalPages={meta.totalPages}
					perPage={perPage}
					isLoading={isLoading}
					isError={isError}
					searchTerm={debouncedSearch}
					classSubjectMap={classSubjectMap}
					onPageChange={setCurrentPage}
					onLimitChange={(limit) => {
						setPerPage(limit);
						setCurrentPage(1);
					}}
					onRetry={() => refetch()}
					onDetail={handleOpenDetail}
					onEdit={handleOpenEdit}
					onDelete={handleOpenDelete}
					onCreateNew={handleOpenCreate}
				/>

				{/* Dialog Modals */}
				<ModuleDialog
					isOpen={isDialogOpen}
					module={editingModule}
					classSubjectOptions={classSubjectOptions}
					isSubmitting={createMutation.isPending || updateMutation.isPending}
					onClose={() => {
						setIsDialogOpen(false);
						setEditingModule(null);
					}}
					onSubmit={handleSubmitForm}
				/>

				<ModuleDetailDialog
					isOpen={Boolean(detailModule)}
					module={detailModule}
					classSubjectMap={classSubjectMap}
					onClose={() => setDetailModule(null)}
					onEdit={handleOpenEdit}
				/>

				<ModuleDeleteDialog
					isOpen={Boolean(deletingModule)}
					module={deletingModule}
					isDeleting={deleteMutation.isPending}
					onClose={() => setDeletingModule(null)}
					onConfirm={handleConfirmDelete}
				/>
			</div>
		</main>
	);
};

