import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { SubjectTable } from "./SubjectTable";
import { SubjectFormDialog } from "./SubjectFormDialog";
import { DeleteSubjectDialog } from "./DeleteSubjectDialog";
import {
	useCreateSubject,
	useDeleteSubject,
	useSubjects,
	useUpdateSubject,
} from "../hooks/useSubjects";
import type { SubjectFormValues } from "../schemas/subjectSchema";
import type { Subject } from "../types";
import { getSubjectErrorMessage } from "../utils/subject-error";

const PAGE_SIZE = 10;

export function SubjectsPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Subject | null>(null);
	const [deleting, setDeleting] = useState<Subject | null>(null);
	const debouncedSearch = useDebounce(search, 300);

	const profileQuery = useProfile();
	const departmentsQuery = useDepartments({ page: 1, limit: 100 });
	const subjectsQuery = useSubjects({
		page,
		limit: PAGE_SIZE,
		search: debouncedSearch.trim() || undefined,
	});
	const createSubject = useCreateSubject();
	const updateSubject = useUpdateSubject();
	const deleteSubject = useDeleteSubject();

	const subjects = subjectsQuery.data?.data ?? [];
	const total = subjectsQuery.data?.total ?? 0;

	const openCreateDialog = () => {
		setEditing(null);
		setDialogOpen(true);
	};

	const openEditDialog = (subject: Subject) => {
		setEditing(subject);
		setDialogOpen(true);
	};

	const closeFormDialog = () => {
		setDialogOpen(false);
		setEditing(null);
	};

	const saveSubject = async (values: SubjectFormValues) => {
		const sharedPayload = {
			code: values.code,
			name: values.name,
			...(values.credits !== undefined ? { credits: values.credits } : {}),
			...(editing
				? { description: values.description }
				: values.description
					? { description: values.description }
					: {}),
		};

		if (editing) {
			await updateSubject.mutateAsync({
				id: editing.id,
				input: {
					...sharedPayload,
					departmentId: values.departmentId || null,
				},
			});
			toast.success(`Mata pelajaran “${values.name}” berhasil diperbarui.`);
		} else {
			const institutionId = profileQuery.profile?.institutionId;
			if (!institutionId) {
				throw new Error("Data institusi tidak tersedia pada profil Anda.");
			}
			await createSubject.mutateAsync({
				...sharedPayload,
				...(values.departmentId ? { departmentId: values.departmentId } : {}),
				institutionId,
			});
			toast.success(`Mata pelajaran “${values.name}” berhasil ditambahkan.`);
		}

		closeFormDialog();
	};

	const confirmDelete = async () => {
		if (!deleting) return;

		await deleteSubject.mutateAsync(deleting.id);
		toast.success(`Mata pelajaran “${deleting.name}” berhasil dihapus.`);
		if (subjects.length === 1 && page > 1) setPage((currentPage) => currentPage - 1);
		setDeleting(null);
	};

	return (
		<main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
			<div className="mx-auto max-w-7xl">
				<header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-medium text-blue-700 dark:text-blue-300">
							Konfigurasi Akademik
						</p>
						<h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							Mata Pelajaran
						</h1>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Kelola daftar mata pelajaran institusi Anda.
						</p>
					</div>
					<Button onClick={openCreateDialog}>
						<Plus /> Tambah Mata Pelajaran
					</Button>
				</header>

				<SubjectTable
					subjects={subjects}
					total={total}
					page={page}
					pageSize={PAGE_SIZE}
					search={search}
					isLoading={subjectsQuery.isPending}
					isFetching={subjectsQuery.isFetching}
					errorMessage={subjectsQuery.isError ? getSubjectErrorMessage(subjectsQuery.error) : undefined}
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
					onRetry={() => void subjectsQuery.refetch()}
					onPageChange={setPage}
					onCreate={openCreateDialog}
					onEdit={openEditDialog}
					onDelete={setDeleting}
				/>
			</div>

			{dialogOpen && (
				<SubjectFormDialog
					key={editing?.id ?? "create"}
					open={dialogOpen}
					mode={editing ? "edit" : "create"}
					subject={editing}
					departments={departmentsQuery.data?.data ?? []}
					departmentsError={departmentsQuery.isError ? "Daftar departemen tidak dapat dimuat." : undefined}
					isSaving={createSubject.isPending || updateSubject.isPending}
					isLoadingInstitution={profileQuery.isPending}
					onOpenChange={(open) => { if (!open) closeFormDialog(); }}
					onSubmit={saveSubject}
				/>
			)}

			<DeleteSubjectDialog
				key={deleting?.id ?? "no-subject"}
				subject={deleting}
				isDeleting={deleteSubject.isPending}
				onClose={() => setDeleting(null)}
				onConfirm={confirmDelete}
			/>
		</main>
	);
}
