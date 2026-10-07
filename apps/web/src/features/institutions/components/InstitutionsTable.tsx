import type { Institution, PaginationMeta } from "../types";

interface InstitutionsTableProps {
	rows: Institution[];
	meta: PaginationMeta | null;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	onEdit: (institution: Institution) => void;
	onDelete: (institution: Institution) => void;
	onPageChange: (page: number) => void;
}

export function InstitutionsTable(props: InstitutionsTableProps) {
	const {
		rows,
		meta,
		isLoading,
		isError,
		onRetry,
		onEdit,
		onDelete,
		onPageChange,
	} = props;
	const totalCount = meta?.totalData ?? rows.length;
	const currentPage = meta?.currentPage ?? 1;
	const totalPages = meta?.totalPages ?? 1;
	const perPage = meta?.perPage ?? rows.length;
	const from = rows.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
	const to = (currentPage - 1) * perPage + rows.length;
	return (
		<div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900 overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
					<thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-400">
						<tr>
							<th scope="col" className="px-5 py-4">
								INSTITUSI
							</th>
							<th scope="col" className="px-5 py-4">
								JENJANG
							</th>
							<th scope="col" className="px-5 py-4">
								LOKASI & TELEPON
							</th>
							<th scope="col" className="px-5 py-4">
								KONTAK
							</th>
							<th scope="col" className="px-5 py-4 text-right">
								AKSI
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
						{isLoading && (
							<tr>
								<td
									colSpan={5}
									className="px-5 py-10 text-center text-sm text-slate-500"
								>
									Memuat data institusi...
								</td>
							</tr>
						)}
						{!isLoading && isError && (
							<tr>
								<td colSpan={5} className="px-5 py-10 text-center text-sm">
									<p className="text-slate-500">Gagal memuat data institusi.</p>
									<button
										type="button"
										onClick={onRetry}
										className="mt-2 font-semibold text-blue-600 hover:underline"
									>
										Coba lagi
									</button>
								</td>
							</tr>
						)}
						{!isLoading && !isError && rows.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="px-5 py-10 text-center text-sm text-slate-500"
								>
									Belum ada institusi. Klik "Tambah institusi" untuk membuat
									data baru.
								</td>
							</tr>
						)}
						{!isLoading &&
							!isError &&
							rows.map((row) => (
								<tr
									key={row.id}
									className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
								>
									<td className="px-5 py-4">
										<div className="flex items-center gap-3">
											<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
												{row.name.substring(0, 2).toUpperCase()}
											</div>
											<div>
												<p className="font-semibold text-slate-900 dark:text-slate-100">
													{row.name}
												</p>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													{row.shortName ? `${row.shortName} • ` : ""}
													{row.city ?? "-"}
												</p>
											</div>
										</div>
									</td>
									<td className="px-5 py-4 font-medium">
										{row.institutionLevel?.name ?? "-"}
									</td>
									<td className="px-5 py-4">
										{[row.city, row.province].filter(Boolean).join(", ") || "-"}
										{row.phoneNumber ? (
											<span className="block text-xs text-slate-500">
												{row.phoneNumber}
											</span>
										) : null}
									</td>
									<td className="px-5 py-4">
										{row.email ? (
											<span className="block">{row.email}</span>
										) : (
											<span className="text-slate-400">-</span>
										)}
										{row.website ? (
											<span className="block text-xs text-blue-600">
												{row.website}
											</span>
										) : null}
									</td>
									<td className="px-5 py-4 text-right">
										<div className="flex items-center justify-end gap-3 font-medium">
											<button
												type="button"
												onClick={() => onEdit(row)}
												className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
											>
												Ubah
											</button>
											<button
												type="button"
												onClick={() => onDelete(row)}
												className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
											>
												Hapus
											</button>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>

			{/* Pagination Footer */}
			<div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-700/60 dark:bg-slate-900">
				<p className="text-sm text-slate-500 dark:text-slate-400">
					Menampilkan{" "}
					<span className="font-medium text-slate-900 dark:text-slate-100">
						{from}-{to}
					</span>{" "}
					dari{" "}
					<span className="font-medium text-slate-900 dark:text-slate-100">
						{totalCount}
					</span>{" "}
					Institusi &bull; Halaman {currentPage} dari {Math.max(totalPages, 1)}
				</p>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => onPageChange(currentPage - 1)}
						className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
						disabled={currentPage <= 1 || isLoading}
						aria-label="Halaman sebelumnya"
					>
						<svg
							aria-hidden="true"
							className="size-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<span className="flex size-8 items-center justify-center rounded-md bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
						{currentPage}
					</span>
					<button
						type="button"
						onClick={() => onPageChange(currentPage + 1)}
						className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
						disabled={currentPage >= totalPages || isLoading}
						aria-label="Halaman berikutnya"
					>
						<svg
							aria-hidden="true"
							className="size-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
