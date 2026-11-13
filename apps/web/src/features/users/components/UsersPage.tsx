import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { useDebounce } from "@/hooks/useDebounce";
import {
	useCreateUser,
	useDeleteUser,
	useUpdateUser,
	useUsersStats,
	useUsers,
} from "../hooks/useUsers";
import type { UserFormValues } from "../schemas/userSchema";
import type { User } from "../types";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { UserFormModal } from "./UserFormModal";
import { UsersHeader } from "./UsersHeader";
import { UsersStats } from "./UsersStats";
import { UsersTable } from "./UsersTable";

function errorMessage(error: unknown): string {
	return error instanceof Error
		? error.message
		: "Terjadi kesalahan. Silakan coba lagi.";
}

export const UsersPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearch = useDebounce(searchTerm);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [userStatus, setUserStatus] = useState<"active" | "deleted">("active");
	const [institutionId, setInstitutionId] = useState("");
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [deletingUser, setDeletingUser] = useState<User | null>(null);
	const [isFormModalOpen, setIsFormModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);
	const { user } = useAuth();
	const isSuperadmin = user?.role?.trim().toLowerCase() === "superadmin";
	const institutionsQuery = useInstitutions(
		{ page: 1, limit: 100 },
		isSuperadmin,
	);

	const normalizedSearch = debouncedSearch.trim();
	const usersQuery = useUsers({
		page: currentPage,
		limit,
		search: normalizedSearch,
		status: userStatus,
		institution_id: institutionId || undefined,
	});
	const statsQuery = useUsersStats(institutionId || undefined);
	const createMutation = useCreateUser();
	const updateMutation = useUpdateUser();
	const deleteMutation = useDeleteUser();
	const usersPage = usersQuery.data;
	const users = usersPage?.data ?? [];
	const meta = usersPage?.meta;

	useEffect(() => {
		if (!notice) return;
		const timeout = window.setTimeout(() => setNotice(null), 4000);
		return () => window.clearTimeout(timeout);
	}, [notice]);

	async function handleFormSubmit(values: UserFormValues) {
		try {
			if (editingUser) {
				const data = {
					email: values.email,
					is_active: values.is_active,
					...(values.password ? { password: values.password } : {}),
				};
				await updateMutation.mutateAsync({ id: editingUser.id, data });
				setNotice({ kind: "success", message: "Pengguna berhasil diperbarui" });
			} else {
				await createMutation.mutateAsync({
					email: values.email,
					password: values.password,
					is_active: values.is_active,
				});
				setNotice({ kind: "success", message: "Pengguna berhasil dibuat" });
			}
			setIsFormModalOpen(false);
			setEditingUser(null);
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
		}
	}

	async function handleConfirmDelete() {
		if (!deletingUser) return;
		try {
			await deleteMutation.mutateAsync(deletingUser.id);
			setNotice({ kind: "success", message: "Pengguna berhasil dihapus" });
			setIsDeleteDialogOpen(false);
			setDeletingUser(null);
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
		}
	}

	const openCreate = () => {
		setEditingUser(null);
		setIsFormModalOpen(true);
	};
	const openEdit = (user: User) => {
		setEditingUser(user);
		setIsFormModalOpen(true);
	};
	const openDelete = (user: User) => {
		setDeletingUser(user);
		setIsDeleteDialogOpen(true);
	};
	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};
	const handleStatusChange = (status: "active" | "deleted") => {
		setUserStatus(status);
		setCurrentPage(1);
	};
	const handleInstitutionChange = (value: string) => {
		setInstitutionId(value);
		setCurrentPage(1);
	};
	const totalPages = Math.max(meta?.totalPages ?? 1, 1);

	return (
		<main className="min-h-screen bg-slate-50 p-4 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				{notice && (
					<div
						role="status"
						className={
							notice.kind === "success"
								? "fixed right-4 top-4 z-[60] rounded-xl border border-emerald-500 bg-emerald-600 p-4 text-sm font-medium text-white shadow-lg"
								: "fixed right-4 top-4 z-[60] rounded-xl border border-red-500 bg-red-600 p-4 text-sm font-medium text-white shadow-lg"
						}
					>
						{notice.message}
					</div>
				)}
				<UsersHeader
					searchTerm={searchTerm}
					onSearchChange={handleSearchChange}
					onOpenCreateModal={openCreate}
					userStatus={userStatus}
					onStatusChange={handleStatusChange}
					isSuperadmin={isSuperadmin}
					institutions={institutionsQuery.data?.data ?? []}
					institutionId={institutionId}
					onInstitutionChange={handleInstitutionChange}
				/>
				<UsersStats
					stats={statsQuery.data}
					scopeLabel={
						isSuperadmin
							? institutionId
								? "dari institusi terpilih"
								: "dari seluruh pengguna"
							: "dari institusi ini"
					}
				/>
				<UsersTable
					users={users}
					isLoading={usersQuery.isLoading}
					isError={usersQuery.isError}
					error={usersQuery.error}
					onRetry={() => usersQuery.refetch()}
					onEdit={openEdit}
					onDelete={openDelete}
					searchTerm={normalizedSearch}
					total={meta?.total ?? 0}
					userStatus={userStatus}
				/>
				{!usersQuery.isLoading &&
					!usersQuery.isError &&
					meta &&
					meta.totalPages > 0 && (
						<div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
							<label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
								Per halaman
								<select
									value={limit}
									onChange={(event) => {
										setLimit(Number(event.target.value));
										setCurrentPage(1);
									}}
									className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
								>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
							</label>
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() =>
										setCurrentPage((page) => Math.max(1, page - 1))
									}
									disabled={currentPage <= 1}
									className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
								>
									Sebelumnya
								</button>
								<span className="text-sm text-slate-600 dark:text-slate-400">
									Halaman {meta.page} dari {totalPages}
								</span>
								<button
									type="button"
									onClick={() =>
										setCurrentPage((page) => Math.min(totalPages, page + 1))
									}
									disabled={currentPage >= totalPages}
									className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
								>
									Berikutnya
								</button>
							</div>
						</div>
					)}
			</div>
			<UserFormModal
				isOpen={isFormModalOpen}
				onClose={() => {
					setIsFormModalOpen(false);
					setEditingUser(null);
				}}
				onSubmit={handleFormSubmit}
				initialData={editingUser}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			/>
			<UserDeleteDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => {
					setIsDeleteDialogOpen(false);
					setDeletingUser(null);
				}}
				onConfirm={handleConfirmDelete}
				user={deletingUser}
				isDeleting={deleteMutation.isPending}
			/>
		</main>
	);
};
