import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	GraduationCap,
	Plus,
} from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { TeacherRow } from "./TeacherRow";
import type { TeachersTableProps } from "./TeachersTable";

export function TeachersTable({
	teachers,
	isLoading,
	isError,
	page,
	limit,
	total,
	totalPages: propTotalPages,
	onPageChange,
	onLimitChange,
	onAdd,
	onEdit,
	onDelete,
}: TeachersTableProps) {
	if (isLoading) {
		return (
			<div className="space-y-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
				{[1, 2, 3, 4, 5].map((item) => (
					<div
						key={item}
						className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
				<AlertCircle className="mx-auto mb-2 size-8" />
				<p className="font-semibold">Gagal memuat data guru</p>
				<p className="text-sm opacity-90">
					Pastikan backend terhubung di VITE_API_URL.
				</p>
			</div>
		);
	}

	if (teachers.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
				<GraduationCap className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" />
				<p className="text-base font-semibold text-slate-800 dark:text-slate-200">
					Belum ada data guru
				</p>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Tambahkan data master guru pertama untuk mulai mengelola penugasan
					kelas.
				</p>
				<Button
					type="button"
					onClick={onAdd}
					className="mt-5 h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					<Plus className="mr-2 size-4" /> Tambah guru
				</Button>
			</div>
		);
	}

	const effectiveTotalPages =
		propTotalPages ?? Math.max(Math.ceil(total / (limit || 10)), 1);
	const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
	const endIdx = Math.min(page * limit, total);

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[920px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
						<tr>
							<th className="px-5 py-3.5">Guru</th>
							<th className="px-5 py-3.5">NIP</th>
							<th className="px-5 py-3.5">Departemen</th>
							<th className="px-5 py-3.5">Spesialisasi</th>
							<th className="px-5 py-3.5">Status</th>
							<th className="px-5 py-3.5">Kelas Diampu</th>
							<th className="px-5 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
						{teachers.map((teacher) => (
							<TeacherRow
								key={teacher.id}
								teacher={teacher}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</tbody>
				</table>
			</div>

			{/* Footer Pagination (di dalam card table) */}
			<div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-5 py-3.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
				<div>
					Menampilkan{" "}
					<span className="font-semibold text-slate-900 dark:text-slate-200">
						{startIdx}
					</span>{" "}
					-{" "}
					<span className="font-semibold text-slate-900 dark:text-slate-200">
						{endIdx}
					</span>{" "}
					dari{" "}
					<span className="font-semibold text-slate-900 dark:text-slate-200">
						{total}
					</span>{" "}
					data
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<span>Per halaman:</span>
						<select
							value={limit}
							onChange={(e) => onLimitChange?.(Number(e.target.value))}
							className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
							aria-label="Jumlah per halaman"
						>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
						</select>
					</div>

					<div className="flex items-center gap-1">
						<button
							type="button"
							disabled={page <= 1}
							onClick={() => onPageChange?.(page - 1)}
							className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
							title="Halaman Sebelumnya"
							aria-label="Halaman Sebelumnya"
						>
							<ChevronLeft className="size-4" />
						</button>

						{Array.from({ length: effectiveTotalPages }, (_, i) => i + 1)
							.filter(
								(p) =>
									p === 1 ||
									p === effectiveTotalPages ||
									Math.abs(p - page) <= 1,
							)
							.map((p, idx, arr) => {
								const prev = arr[idx - 1];
								const showEllipsis = prev && p - prev > 1;

								return (
									<Fragment key={p}>
										{showEllipsis && (
											<span className="px-1 text-slate-400">...</span>
										)}
										<button
											type="button"
											onClick={() => onPageChange?.(p)}
											className={`min-w-7 rounded-md px-2 py-1 text-xs font-medium ${
												p === page
													? "bg-blue-600 text-white dark:bg-blue-600"
													: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
											}`}
										>
											{p}
										</button>
									</Fragment>
								);
							})}

						<button
							type="button"
							disabled={page >= effectiveTotalPages}
							onClick={() => onPageChange?.(page + 1)}
							className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
							title="Halaman Berikutnya"
							aria-label="Halaman Berikutnya"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
