import { useMemo, useState } from "react";
import {
	useCreateSetting,
	useDeleteSetting,
	useSettings,
	useUpdateSetting,
} from "../hooks/useSettings";
import type { SettingFormValues } from "../schemas/settingSchema";
import type { Setting } from "../types";
import { DeleteSettingDialog } from "./DeleteSettingDialog";
import { SettingDialog } from "./SettingDialog";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsStats } from "./SettingsStats";
import { SettingsTable } from "./SettingsTable";

function errorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan. Silakan coba lagi.";
}

export function SettingsPage() {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [search, setSearch] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [editingItem, setEditingItem] = useState<Setting | null>(null);
	const [deletingItem, setDeletingItem] = useState<Setting | null>(null);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	const settingsQuery = useSettings({ page, limit, search });
	const createMutation = useCreateSetting();
	const updateMutation = useUpdateSetting();
	const deleteMutation = useDeleteSetting();

	const settings = useMemo(
		() => settingsQuery.data?.data ?? [],
		[settingsQuery.data?.data],
	);

	const meta = settingsQuery.data?.meta ?? {
		total: settings.length,
		page: 1,
		limit: 10,
		totalPages: 1,
	};

	const handleCreate = async (values: SettingFormValues) => {
		try {
			await createMutation.mutateAsync({
				settingKey: values.settingKey.trim(),
				settingValue: values.settingValue || undefined,
				description: values.description || undefined,
			});
			setIsAdding(false);
			setNotice({
				kind: "success",
				message: `Pengaturan "${values.settingKey}" berhasil ditambahkan.`,
			});
		} catch (err) {
			setNotice({ kind: "error", message: errorMessage(err) });
		}
	};

	const handleUpdate = async (values: SettingFormValues) => {
		if (!editingItem) return;
		try {
			await updateMutation.mutateAsync({
				id: editingItem.id,
				input: {
					settingValue: values.settingValue || undefined,
					description: values.description || undefined,
				},
			});
			setEditingItem(null);
			setNotice({
				kind: "success",
				message: `Pengaturan "${editingItem.settingKey}" berhasil diperbarui.`,
			});
		} catch (err) {
			setNotice({ kind: "error", message: errorMessage(err) });
		}
	};

	const handleDelete = async () => {
		if (!deletingItem) return;
		try {
			await deleteMutation.mutateAsync(deletingItem.id);
			const keyName = deletingItem.settingKey;
			setDeletingItem(null);
			setNotice({
				kind: "success",
				message: `Pengaturan "${keyName}" berhasil dihapus.`,
			});
		} catch (err) {
			setNotice({ kind: "error", message: errorMessage(err) });
		}
	};

	return (
		<main className="min-h-full bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<SettingsHeader onAdd={() => setIsAdding(true)} />

				{/* Notice alert */}
				{notice && (
					<div
						className={`flex items-center justify-between rounded-lg p-4 text-sm font-medium shadow-sm transition-all ${
							notice.kind === "success"
								? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
								: "border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
						}`}
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

				{/* API error alert */}
				{settingsQuery.isError && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
						{errorMessage(settingsQuery.error)}
					</div>
				)}

				<SettingsStats
					settings={settings}
					isLoading={settingsQuery.isPending}
				/>

				<SettingsTable
					settings={settings}
					isLoading={settingsQuery.isPending}
					search={search}
					onSearchChange={(val) => {
						setSearch(val);
						setPage(1);
					}}
					onEdit={(item) => setEditingItem(item)}
					onDelete={(item) => setDeletingItem(item)}
					page={meta.page}
					totalPages={meta.totalPages}
					totalData={meta.total}
					onPageChange={(newPage) => setPage(newPage)}
				/>
			</div>

			{/* Add dialog */}
			{isAdding && (
				<SettingDialog
					open={isAdding}
					isSaving={createMutation.isPending}
					onClose={() => setIsAdding(false)}
					onSave={handleCreate}
				/>
			)}

			{/* Edit dialog */}
			{editingItem && (
				<SettingDialog
					open={Boolean(editingItem)}
					setting={editingItem}
					isSaving={updateMutation.isPending}
					onClose={() => setEditingItem(null)}
					onSave={handleUpdate}
				/>
			)}

			{/* Delete confirmation dialog */}
			{deletingItem && (
				<DeleteSettingDialog
					open={Boolean(deletingItem)}
					setting={deletingItem}
					isDeleting={deleteMutation.isPending}
					onClose={() => setDeletingItem(null)}
					onConfirm={handleDelete}
				/>
			)}
		</main>
	);
}
