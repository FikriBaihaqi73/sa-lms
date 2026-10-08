import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AcademicYear } from "../types";

interface Props {
	rows: AcademicYear[];
	totalCount: number;
	isLoading: boolean;
	onEdit: (item: AcademicYear) => void;
	onDelete: (item: AcademicYear) => void;
}

export function AcademicYearsTable({ rows, totalCount, isLoading, onEdit, onDelete }: Props) {
	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[640px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
						<tr>
							<th className="px-6 py-3.5">Tahun Ajaran</th>
							<th className="px-4 py-3.5 text-center">Status</th>
							<th className="px-6 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{isLoading ? (
							<tr>
								<td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
									Memuat data tahun ajaran...
								</td>
							</tr>
						) : rows.length === 0 ? (
							<tr>
								<td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
									Belum ada data tahun ajaran untuk filter ini.
								</td>
							</tr>
						) : (
							rows.map((item) => (
								<tr key={item.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
									<td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
										{item.academic_year}
									</td>
									<td className="px-4 py-4 text-center">
										<span
											className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
												item.is_active
													? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
													: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
											}`}
										>
											{item.is_active ? "Aktif" : "Tidak Aktif"}
										</span>
									</td>
									<td className="px-6 py-4 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button
													type="button"
													aria-label="Buka menu aksi"
													className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
												>
													<MoreHorizontal className="size-4" />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Aksi</DropdownMenuLabel>
												<DropdownMenuItem onClick={() => onEdit(item)}>
													<Pencil className="mr-2 size-4" /> Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => onDelete(item)}
												>
													<Trash className="mr-2 size-4" /> Hapus
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<div className="border-t border-slate-200 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
				Menampilkan {rows.length} dari {totalCount} data tahun ajaran.
			</div>
		</div>
	);
}