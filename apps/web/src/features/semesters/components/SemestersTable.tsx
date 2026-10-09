import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Semester, SemesterPageMeta } from "../types";

interface SemestersTableProps {
	rows: Semester[];
	meta: SemesterPageMeta | undefined;
	isLoading: boolean;
	isError: boolean;
	errorMessage?: string;
	onEdit: (semester: Semester) => void;
	onDelete: (semester: Semester) => void;
	onPageChange: (page: number) => void;
}

function formatDate(value: string | null): string {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

export function SemestersTable({
	rows,
	meta,
	isLoading,
	isError,
	errorMessage,
	onEdit,
	onDelete,
	onPageChange,
}: SemestersTableProps) {
	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[900px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
						<tr>
							<th className="px-5 py-3.5">Nama Semester</th>
							<th className="px-4 py-3.5">Academic Year</th>
							<th className="px-4 py-3.5">Tanggal Mulai</th>
							<th className="px-4 py-3.5">Tanggal Selesai</th>
							<th className="px-4 py-3.5 text-center">Status</th>
							<th className="px-5 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{isLoading ? (
							<tr>
								<td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
									Memuat data semester...
								</td>
							</tr>
						) : isError ? (
							<tr>
								<td colSpan={6} className="px-6 py-10 text-center text-red-600 dark:text-red-400">
									<p className="font-semibold">Gagal memuat data semester.</p>
									<p className="mt-1 text-xs">{errorMessage ?? "Pastikan backend terhubung."}</p>
								</td>
							</tr>
						) : rows.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
									<p className="font-semibold text-slate-700 dark:text-slate-200">Belum ada semester.</p>
									<p className="mt-1 text-xs">Coba ubah pencarian atau tambahkan semester baru.</p>
								</td>
							</tr>
						) : (
							rows.map((semester) => (
								<tr key={semester.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
									<td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{semester.name}</td>
									<td className="px-4 py-4 text-slate-600 dark:text-slate-400">{semester.academicYear?.academic_year ?? "-"}</td>
									<td className="px-4 py-4 text-slate-600 dark:text-slate-400">{formatDate(semester.start_date)}</td>
									<td className="px-4 py-4 text-slate-600 dark:text-slate-400">{formatDate(semester.end_date)}</td>
									<td className="px-4 py-4 text-center">
										<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${semester.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
											{semester.is_active ? "Aktif" : "Tidak Aktif"}
										</span>
									</td>
									<td className="px-5 py-4 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button type="button" aria-label={`Buka aksi untuk ${semester.name}`} className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
													<MoreHorizontal className="size-4" />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Aksi</DropdownMenuLabel>
												<DropdownMenuItem onClick={() => onEdit(semester)}><Pencil className="mr-2 size-4" /> Edit</DropdownMenuItem>
												<DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(semester)}><Trash className="mr-2 size-4" /> Hapus</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
				<span>Menampilkan {rows.length} dari {meta?.total ?? 0} semester.</span>
				{meta && meta.totalPages > 0 && (
					<div className="flex items-center gap-3">
						<Button type="button" variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, meta.page - 1))} disabled={meta.page <= 1}>Sebelumnya</Button>
						<span>Halaman {meta.page} dari {meta.totalPages}</span>
						<Button type="button" variant="outline" size="sm" onClick={() => onPageChange(Math.min(meta.totalPages, meta.page + 1))} disabled={meta.page >= meta.totalPages}>Berikutnya</Button>
					</div>
				)}
			</div>
		</div>
	);
}

