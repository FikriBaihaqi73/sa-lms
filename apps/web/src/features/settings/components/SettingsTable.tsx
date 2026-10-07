import { ChevronLeft, ChevronRight, Edit, Search, Trash2 } from "lucide-react";
import type { Setting } from "../types";

interface SettingsTableProps {
	settings: Setting[];
	isLoading: boolean;
	search: string;
	onSearchChange: (value: string) => void;
	onEdit: (item: Setting) => void;
	onDelete: (item: Setting) => void;
	page: number;
	totalPages: number;
	totalData: number;
	onPageChange: (newPage: number) => void;
}

export function SettingsTable({
	settings,
	isLoading,
	search,
	onSearchChange,
	onEdit,
	onDelete,
	page,
	totalPages,
	totalData,
	onPageChange,
}: SettingsTableProps) {
	const q = search.trim().toLowerCase();
	const rows = settings.filter(
		(item) =>
			!q ||
			item.settingKey.toLowerCase().includes(q) ||
			(item.settingValue ?? "").toLowerCase().includes(q) ||
			(item.description ?? "").toLowerCase().includes(q),
	);

	const formatDate = (dateString?: string | Date | null) => {
		if (!dateString) return "-";
		const d = new Date(dateString);
		return new Intl.DateTimeFormat("id-ID", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(d);
	};

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="border-b border-slate-200 p-4 dark:border-slate-800">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Cari kunci pengaturan, nilai, atau deskripsi..."
						className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
					/>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
						<tr>
							<th className="px-6 py-3.5">Kunci Pengaturan</th>
							<th className="px-6 py-3.5">Nilai (Value)</th>
							<th className="px-6 py-3.5">Keterangan</th>
							<th className="px-6 py-3.5">Terakhir Diperbarui</th>
							<th className="px-6 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{isLoading ? (
							<tr>
								<td
									colSpan={5}
									className="px-6 py-8 text-center text-slate-500"
								>
									<div className="flex items-center justify-center gap-2">
										<span className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
										<span>Memuat data pengaturan...</span>
									</div>
								</td>
							</tr>
						) : rows.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-6 py-10 text-center text-slate-500"
								>
									<p className="font-medium text-slate-700 dark:text-slate-300">
										Tidak ada pengaturan ditemukan.
									</p>
									<p className="mt-1 text-xs text-slate-400">
										{search
											? "Coba gunakan kata kunci pencarian lain."
											: "Klik tombol 'Tambah Pengaturan' untuk menambahkan konfigurasi baru."}
									</p>
								</td>
							</tr>
						) : (
							rows.map((item) => (
								<tr
									key={item.id}
									className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
								>
									<td className="px-6 py-4">
										<span className="inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
											{item.settingKey}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="max-w-xs truncate font-mono text-xs text-slate-700 dark:text-slate-300 sm:max-w-sm">
											{item.settingValue ?? (
												<span className="italic text-slate-400">(kosong)</span>
											)}
										</div>
									</td>
									<td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
										{item.description || "-"}
									</td>
									<td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
										<div>{formatDate(item.updatedAt || item.createdAt)}</div>
										{item.updater && (
											<div className="mt-0.5 text-[11px] text-slate-400">
												Oleh: {item.updater.email}
											</div>
										)}
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex justify-end gap-2">
											<button
												type="button"
												onClick={() => onEdit(item)}
												className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
											>
												<Edit className="size-3.5" /> Ubah
											</button>
											<button
												type="button"
												onClick={() => onDelete(item)}
												className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
											>
												<Trash2 className="size-3.5" /> Hapus
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination controls */}
			<div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-3.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
				<span>
					Menampilkan total <strong>{totalData}</strong> pengaturan
				</span>
				<div className="flex items-center gap-2">
					<span>
						Halaman {page} dari {totalPages || 1}
					</span>
					<div className="flex gap-1">
						<button
							type="button"
							disabled={page <= 1}
							onClick={() => onPageChange(page - 1)}
							className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<ChevronLeft className="size-4" />
						</button>
						<button
							type="button"
							disabled={page >= totalPages || totalPages === 0}
							onClick={() => onPageChange(page + 1)}
							className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
