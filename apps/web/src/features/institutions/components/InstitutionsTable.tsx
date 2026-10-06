import { cn } from "@/lib/utils";
import type { InstitutionRow } from "../types";

interface InstitutionsTableProps {
	rows: InstitutionRow[];
	totalCount: number;
}

export function InstitutionsTable({
	rows,
	totalCount,
}: InstitutionsTableProps) {
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
								JENIS
							</th>
							<th scope="col" className="px-5 py-4">
								PAKET
							</th>
							<th scope="col" className="px-5 py-4">
								PENGGUNA
							</th>
							<th scope="col" className="px-5 py-4">
								KURSUS
							</th>
							<th scope="col" className="px-5 py-4">
								STATUS
							</th>
							<th scope="col" className="px-5 py-4 text-right">
								AKSI
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
						{rows.map((row) => (
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
												{row.code} &bull; {row.location}
											</p>
										</div>
									</div>
								</td>
								<td className="px-5 py-4 font-medium">{row.type}</td>
								<td className="px-5 py-4">
									<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
										<svg
											aria-hidden="true"
											className="size-3 text-blue-500"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
										</svg>
										{row.package}
									</span>
								</td>
								<td className="px-5 py-4 font-medium">
									{row.users.toLocaleString("id-ID")}
								</td>
								<td className="px-5 py-4 font-medium">{row.courses}</td>
								<td className="px-5 py-4">
									<span
										className={cn(
											"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
											row.status === "Aktif"
												? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
												: row.status === "Nonaktif"
													? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
													: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
										)}
									>
										<span
											className={cn(
												"size-1.5 rounded-full",
												row.status === "Aktif"
													? "bg-emerald-500"
													: row.status === "Nonaktif"
														? "bg-red-500"
														: "bg-amber-500",
											)}
										/>
										{row.status}
									</span>
								</td>
								<td className="px-5 py-4 text-right">
									<div className="flex items-center justify-end gap-3 font-medium">
										<button
											type="button"
											className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
										>
											Ubah
										</button>
										<button
											type="button"
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
						1-{Math.min(6, totalCount)}
					</span>{" "}
					dari{" "}
					<span className="font-medium text-slate-900 dark:text-slate-100">
						{totalCount}
					</span>{" "}
					Institusi &bull; Halaman 1 dari 2
				</p>
				<div className="flex items-center gap-1">
					<button
						type="button"
						className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
						disabled
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
					<button
						type="button"
						className="flex size-8 items-center justify-center rounded-md bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
					>
						1
					</button>
					<button
						type="button"
						className="flex size-8 items-center justify-center rounded-md font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						2
					</button>
					<button
						type="button"
						className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
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
