import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { ApiError } from "@/lib/api";
import {
	useCreateTeacher,
	useDeleteTeacher,
	useEmploymentStatuses,
	useSpecializations,
	useTeacherDepartments,
	useTeacherStats,
	useTeachers,
	useUpdateTeacher,
} from "../hooks/useTeachers";
import type {
	CreateTeacherFormValues,
	UpdateTeacherFormValues,
} from "../schemas/teacherSchema";
import { DeleteTeacherDialog } from "./DeleteTeacherDialog";
import { TeacherCredentialModal } from "./TeacherCredentialModal";
import { TeacherDialogForm } from "./TeacherDialogForm";
import { TeacherFilterBar } from "./TeacherFilterBar";
import { TeacherStatsCards } from "./TeacherStatsCards";
import { TeachersHeader } from "./TeachersHeader";
import {
	toCreateInput,
	toUpdateInput,
	useTeachersPageState,
} from "./TeachersPage";
import { TeachersTable } from "./TeachersTableBody";

function parseErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.fieldErrors.length > 0) {
			return `${error.message}: ${error.fieldErrors
				.map((f) => `${f.field || "input"} - ${f.message}`)
				.join("; ")}`;
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan pada sistem. Silakan coba lagi.";
}

export function useTeachersPageController() {
	const state = useTeachersPageState();
	const teachersQuery = useTeachers({
		page: state.page,
		limit: state.limit,
		search: state.debouncedSearch.trim(),
		status: state.statusId,
		specialization: state.specializationId,
	});
	const statsQuery = useTeacherStats();
	const statusesQuery = useEmploymentStatuses();
	const specializationsQuery = useSpecializations();
	const departmentsQuery = useTeacherDepartments();
	const createMutation = useCreateTeacher();
	const updateMutation = useUpdateTeacher();
	const deleteMutation = useDeleteTeacher();

	const teachers = teachersQuery.data?.data ?? [];
	const meta = teachersQuery.data?.meta;
	const totalPages = Math.max(meta?.totalPages ?? 1, 1);

	useEffect(() => {
		if (!state.notice) return;
		const timer = window.setTimeout(() => {
			state.setNotice(null);
		}, 4000);
		return () => window.clearTimeout(timer);
	}, [state.notice, state.setNotice]);

	async function handleCreate(values: CreateTeacherFormValues) {
		try {
			await createMutation.mutateAsync(toCreateInput(values));
			state.setIsAdding(false);
			state.setCreatedCredentials({
				fullName: values.full_name,
				email: values.email,
				password: values.password,
				teacherNumber: values.teacher_number,
			});
			state.setNotice({
				kind: "success",
				message: "Akun login dan data guru berhasil dibuat.",
			});
			await Promise.all([teachersQuery.refetch(), statsQuery.refetch()]);
		} catch (error) {
			const msg = parseErrorMessage(error);
			state.setNotice({ kind: "error", message: msg });
		}
	}

	async function handleUpdate(id: string, values: UpdateTeacherFormValues) {
		try {
			await updateMutation.mutateAsync({ id, input: toUpdateInput(values) });
			state.setEditingTeacher(null);
			state.setNotice({
				kind: "success",
				message: "Perubahan data guru berhasil disimpan.",
			});
			await Promise.all([teachersQuery.refetch(), statsQuery.refetch()]);
		} catch (error) {
			const msg = parseErrorMessage(error);
			state.setNotice({ kind: "error", message: msg });
		}
	}

	async function handleDelete() {
		if (!state.deletingTeacher) return;
		try {
			await deleteMutation.mutateAsync(state.deletingTeacher.id);
			state.setDeletingTeacher(null);
			state.setNotice({
				kind: "success",
				message: "Data guru berhasil dihapus.",
			});
			await Promise.all([teachersQuery.refetch(), statsQuery.refetch()]);
		} catch (error) {
			const msg = parseErrorMessage(error);
			state.setNotice({ kind: "error", message: msg });
		}
	}

	return {
		state,
		teachersQuery,
		statsQuery,
		statusesQuery,
		specializationsQuery,
		departmentsQuery,
		createMutation,
		updateMutation,
		deleteMutation,
		teachers,
		meta,
		totalPages,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
}

export type TeachersPageController = ReturnType<
	typeof useTeachersPageController
>;

export function TeachersPageLayout({
	controller,
}: {
	controller: TeachersPageController;
}) {
	const {
		state,
		teachersQuery,
		statsQuery,
		statusesQuery,
		specializationsQuery,
		departmentsQuery,
		createMutation,
		updateMutation,
		deleteMutation,
		teachers,
		meta,
		totalPages,
		handleCreate,
		handleUpdate,
		handleDelete,
	} = controller;

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
			{/* Pop-up Card Notifikasi (Pojok Kanan Atas, Auto-dismiss 3-5 detik) */}
			{state.notice && (
				<div
					role="status"
					aria-live="polite"
					className={`fixed top-20 right-6 z-[100] flex max-w-md items-center gap-3.5 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
						state.notice.kind === "success"
							? "border-emerald-500/30 bg-white/95 text-slate-900 shadow-emerald-950/10 dark:border-emerald-500/40 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-black/60"
							: "border-red-500/30 bg-white/95 text-slate-900 shadow-red-950/10 dark:border-red-500/40 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-black/60"
					}`}
				>
					<span
						className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
							state.notice.kind === "success"
								? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
								: "bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400"
						}`}
					>
						{state.notice.kind === "success" ? (
							<CheckCircle2 className="size-5" />
						) : (
							<AlertCircle className="size-5" />
						)}
					</span>
					<div className="flex-1 pr-1 text-sm font-medium leading-snug">
						{state.notice.message}
					</div>
					<button
						type="button"
						onClick={() => state.setNotice(null)}
						className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
						aria-label="Tutup notifikasi"
					>
						<X className="size-4" />
					</button>
				</div>
			)}

			<div className="mx-auto max-w-7xl space-y-6">
				{/* 1. Header */}
				<TeachersHeader onOpenCreate={() => state.setIsAdding(true)} />

				{/* 2. Kartu Statistik */}
				<TeacherStatsCards
					stats={statsQuery.data}
					isLoading={statsQuery.isPending}
					isError={statsQuery.isError}
				/>

				{/* 3. Bar Pencarian & Filter */}
				<TeacherFilterBar
					search={state.search}
					statusId={state.statusId}
					specializationId={state.specializationId}
					departmentId={state.departmentId}
					statuses={statusesQuery.data ?? []}
					specializations={specializationsQuery.data ?? []}
					departments={departmentsQuery.data ?? []}
					onSearchChange={(value) => {
						state.setSearch(value);
						state.setPage(1);
					}}
					onStatusChange={(value) => {
						state.setStatusId(value);
						state.setPage(1);
					}}
					onSpecializationChange={(value) => {
						state.setSpecializationId(value);
						state.setPage(1);
					}}
					onDepartmentChange={(value) => {
						state.setDepartmentId(value);
						state.setPage(1);
					}}
				/>

				{/* 4. Tabel Data Guru (Paginasi di dalam tabel) */}
				<TeachersTable
					teachers={teachers}
					isLoading={teachersQuery.isPending}
					isError={teachersQuery.isError}
					page={meta?.page ?? state.page}
					limit={meta?.limit ?? state.limit}
					total={meta?.total ?? 0}
					totalPages={totalPages}
					onPageChange={(p) => state.setPage(p)}
					onLimitChange={(l) => {
						state.setLimit(l);
						state.setPage(1);
					}}
					onAdd={() => state.setIsAdding(true)}
					onEdit={(t) => state.setEditingTeacher(t)}
					onDelete={(t) => state.setDeletingTeacher(t)}
				/>
			</div>

			{/* Modal Dialog Form (Create) */}
			{state.isAdding && (
				<TeacherDialogForm
					open={state.isAdding}
					statuses={statusesQuery.data ?? []}
					specializations={specializationsQuery.data ?? []}
					departments={departmentsQuery.data ?? []}
					isSaving={createMutation.isPending}
					onClose={() => state.setIsAdding(false)}
					onSaveCreate={handleCreate}
					onSaveUpdate={handleUpdate}
				/>
			)}

			{/* Modal Dialog Form (Edit) */}
			{state.editingTeacher && (
				<TeacherDialogForm
					open={Boolean(state.editingTeacher)}
					teacher={state.editingTeacher}
					statuses={statusesQuery.data ?? []}
					specializations={specializationsQuery.data ?? []}
					departments={departmentsQuery.data ?? []}
					isSaving={updateMutation.isPending}
					onClose={() => state.setEditingTeacher(null)}
					onSaveCreate={handleCreate}
					onSaveUpdate={handleUpdate}
				/>
			)}

			{/* Modal Kredensial Baru Dibuat */}
			<TeacherCredentialModal
				open={Boolean(state.createdCredentials)}
				credentials={state.createdCredentials}
				onClose={() => state.setCreatedCredentials(null)}
			/>

			{/* Dialog Konfirmasi Hapus */}
			<DeleteTeacherDialog
				teacher={state.deletingTeacher}
				isDeleting={deleteMutation.isPending}
				onClose={() => state.setDeletingTeacher(null)}
				onConfirm={handleDelete}
			/>
		</main>
	);
}

export function TeachersPage() {
	const controller = useTeachersPageController();
	return <TeachersPageLayout controller={controller} />;
}
