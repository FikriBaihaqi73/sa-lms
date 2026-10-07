import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	useCreateInstitution,
	useDeleteInstitution,
	useInstitutionLevels,
	useInstitutions,
	useUpdateInstitution,
} from "../hooks/useInstitutions";
import type { InstitutionFormValues } from "../schemas/institutionSchema";
import type { Institution } from "../types";
import { DeleteInstitutionDialog } from "./DeleteInstitutionDialog";
import { InstitutionDialog } from "./InstitutionDialog";
import { InstitutionsFilterBar } from "./InstitutionsFilterBar";
import { InstitutionsStats } from "./InstitutionsStats";
import { InstitutionsTable } from "./InstitutionsTable";

const PAGE_SIZE = 10;

function errorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan. Silakan coba lagi.";
}

function toPayload(values: InstitutionFormValues) {
	const optional = (value: string | undefined) => {
		const trimmed = value?.trim();
		return trimmed ? trimmed : undefined;
	};
	return {
		institutionLevelId: values.institutionLevelId,
		name: values.name.trim(),
		shortName: optional(values.shortName),
		city: optional(values.city),
		province: optional(values.province),
		address: undefined,
		phoneNumber: optional(values.phoneNumber),
		email: optional(values.email),
		website: optional(values.website),
	};
}

export function InstitutionsPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [levelId, setLevelId] = useState("all");
	const [page, setPage] = useState(1);
	const [isAdding, setIsAdding] = useState(false);
	const [editingItem, setEditingItem] = useState<Institution | null>(null);
	const [deletingItem, setDeletingItem] = useState<Institution | null>(null);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search.trim());
			setPage(1);
		}, 400);
		return () => clearTimeout(timer);
	}, [search]);

	const listQuery = useInstitutions({
		page,
		limit: PAGE_SIZE,
		search: debouncedSearch,
	});
	const levelsQuery = useInstitutionLevels();
	const createMutation = useCreateInstitution();
	const updateMutation = useUpdateInstitution();
	const deleteMutation = useDeleteInstitution();

	const rows = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
	const meta = listQuery.data?.meta ?? null;
	const levels = useMemo(() => levelsQuery.data ?? [], [levelsQuery.data]);

	const filteredRows = useMemo(() => {
		if (levelId === "all") return rows;
		return rows.filter((row) => row.institutionLevelId === levelId);
	}, [rows, levelId]);

	const stats = useMemo(() => {
		const total = meta?.totalData ?? rows.length;
		const cities = new Set(rows.map((row) => row.city?.trim()).filter(Boolean));
		const now = new Date();
		const newThisMonth = rows.filter((row) => {
			const created = new Date(row.createdAt);
			return (
				created.getMonth() === now.getMonth() &&
				created.getFullYear() === now.getFullYear()
			);
		}).length;
		return {
			total,
			levelCount: levels.length,
			cityCount: cities.size,
			newThisMonth,
		};
	}, [rows, meta, levels]);

	const handleCreate = async (values: InstitutionFormValues) => {
		try {
			await createMutation.mutateAsync(toPayload(values));
			setIsAdding(false);
			setPage(1);
			setNotice({
				kind: "success",
				message: "Institusi berhasil ditambahkan.",
			});
		} catch (err) {
			setNotice({ kind: "error", message: errorMessage(err) });
		}
	};

	const handleUpdate = async (values: InstitutionFormValues) => {
		if (!editingItem) return;
		try {
			await updateMutation.mutateAsync({
				id: editingItem.id,
				input: toPayload(values),
			});
			setEditingItem(null);
			setNotice({ kind: "success", message: "Institusi berhasil diperbarui." });
		} catch (err) {
			setNotice({ kind: "error", message: errorMessage(err) });
		}
	};

	const handleDelete = async () => {
		if (!deletingItem) return;
		try {
			await deleteMutation.mutateAsync(deletingItem.id);
			setDeletingItem(null);
			setNotice({ kind: "success", message: "Institusi berhasil dihapus." });
		} catch (err) {
			setNotice({ kind: "error", message: errorMessage(err) });
		}
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0f172a] dark:text-slate-50 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
								Institusi
							</h1>
							<span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-400">
								{stats.total} Terdaftar
							</span>
						</div>
						<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
							Kelola seluruh institusi yang terhubung pada LMS.
						</p>
					</div>
					<Button
						type="button"
						onClick={() => setIsAdding(true)}
						className="h-10 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
					>
						<Plus className="size-4 mr-2" /> Tambah institusi
					</Button>
				</header>
				{notice && (
					<div
						className={`flex items-center justify-between rounded-lg p-4 text-sm font-medium shadow-sm ${notice.kind === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300" : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300"}`}
					>
						<span>{notice.message}</span>
						<button
							type="button"
							onClick={() => setNotice(null)}
							className="text-xs font-semibold hover:underline"
						>
							Tutup
						</button>
					</div>
				)}
				<InstitutionsStats
					total={stats.total}
					levelCount={stats.levelCount}
					cityCount={stats.cityCount}
					newThisMonth={stats.newThisMonth}
					isLoading={listQuery.isPending}
				/>
				<div className="space-y-4">
					<InstitutionsFilterBar
						search={search}
						onSearchChange={setSearch}
						levelId={levelId}
						onLevelChange={(value) => {
							setLevelId(value);
							setPage(1);
						}}
						levels={levels}
						isLoading={listQuery.isFetching}
						onRefresh={() => listQuery.refetch()}
					/>
					<InstitutionsTable
						rows={filteredRows}
						meta={meta}
						isLoading={listQuery.isPending}
						isError={listQuery.isError}
						onRetry={() => listQuery.refetch()}
						onEdit={(item) => setEditingItem(item)}
						onDelete={(item) => setDeletingItem(item)}
						onPageChange={setPage}
					/>
				</div>
			</div>
			{isAdding && (
				<InstitutionDialog
					open={isAdding}
					levels={levels}
					isSaving={createMutation.isPending}
					onClose={() => setIsAdding(false)}
					onSave={handleCreate}
				/>
			)}
			{editingItem && (
				<InstitutionDialog
					open={Boolean(editingItem)}
					institution={editingItem}
					levels={levels}
					isSaving={updateMutation.isPending}
					onClose={() => setEditingItem(null)}
					onSave={handleUpdate}
				/>
			)}
			{deletingItem && (
				<DeleteInstitutionDialog
					institution={deletingItem}
					isDeleting={deleteMutation.isPending}
					onClose={() => setDeletingItem(null)}
					onConfirm={handleDelete}
				/>
			)}
		</main>
	);
}
