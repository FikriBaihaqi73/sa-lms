import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	GraduationCap,
	RotateCcw,
	UserMinus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type {
	ClassStudentItem,
	ClassStudentPageMeta,
	ClassStudentStatusFilter,
} from "../types";
import { formatIndonesianDate, getInitials, getPaginationText } from "../utils";

interface ClassStudentsTableProps {
	rows: ClassStudentItem[];
	meta: ClassStudentPageMeta | null;
	status: ClassStudentStatusFilter;
	isLoading: boolean;
	isError: boolean;
	searchTerm: string;
	hasFilterActive: boolean;
	selectedIds: Set<string>;
	onToggleSelectRow: (id: string) => void;
	onToggleSelectAll: () => void;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onRetry: () => void;
	onRemoveSingle: (item: ClassStudentItem) => void;
	onRemoveBulk: () => void;
	onRestore: (item: ClassStudentItem) => void;
	isRestoring?: boolean;
}

export function ClassStudentsTable({
	rows,
	meta,
	status,
	isLoading,
	isError,
	searchTerm,
	hasFilterActive,
	selectedIds,
	onToggleSelectRow,
	onToggleSelectAll,
	onPageChange,
	onLimitChange,
	onRetry,
	onRemoveSingle,
	onRemoveBulk,
	onRestore,
	isRestoring = false,
}: ClassStudentsTableProps) {
	const currentPage = meta?.page ?? 1;
	const currentLimit = meta?.limit ?? 10;
	const total = meta?.total ?? 0;
	const totalPages = Math.max(meta?.totalPages ?? 1, 1);

	const safeRows = Array.isArray(rows) ? rows : [];
	const isAllSelected =
		safeRows.length > 0 && safeRows.every((r) => selectedIds.has(r.id));
	const isPartiallySelected =
		safeRows.some((r) => selectedIds.has(r.id)) && !isAllSelected;

	// State: Loading skeleton
	if (isLoading) {
		return (
			<div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
				{[1, 2, 3, 4, 5].map((item) => (
					<div
						key={item}
						className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
					/>
				))}
			</div>
		);
	}

	// State: Error
	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
				<AlertCircle className="mx-auto mb-2 size-8" />
				<p className="font-semibold">Gagal memuat data penempatan siswa</p>
				<p className="text-sm opacity-90">
					Pastikan server backend terhubung dan berjalan.
				</p>
				<Button
					type="button"
					variant="outline"
					onClick={onRetry}
					className="mt-3 font-semibold dark:border-red-800 dark:text-red-300"
				>
					Coba lagi
				</Button>
			</div>
		);
	}

	// State: Empty
	if (safeRows.length === 0) {
		const isSearchOrFiltered = searchTerm.trim().length > 0 || hasFilterActive;
		let emptyTitle = "Belum ada siswa di kelas";
		let emptyDesc = "Klik Tambah Siswa ke Kelas untuk menambahkan data.";

		if (isSearchOrFiltered) {
			emptyTitle = "Data tidak ditemukan";
			emptyDesc = "Coba ubah kata kunci atau filter.";
		} else if (status === "deleted") {
			emptyTitle = "Tidak ada siswa yang dikeluarkan";
			emptyDesc = "Siswa yang dikeluarkan dari kelas akan muncul di sini.";
		}

		return (
			<div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
				<GraduationCap className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" />
				<p className="text-base font-semibold text-slate-800 dark:text-slate-200">
					{emptyTitle}
				</p>
				<p className="mt-1 text-sm">{emptyDesc}</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			{/* 3.6 Bilah Aksi Massal (hanya saat status Aktif dan ada baris dicentang) */}
			{status === "active" && selectedIds.size > 0 && (
				<div className="flex items-center justify-between border-b border-blue-200 bg-blue-50/70 px-5 py-3 dark:border-blue-900/60 dark:bg-blue-950/40">
					<span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
						{selectedIds.size} siswa dipilih
					</span>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={onRemoveBulk}
						className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
					>
						<UserMinus className="mr-1.5 size-3.5" />
						Keluarkan dari kelas
					</Button>
				</div>
			)}

			{/* Tabel */}
			<div className="overflow-x-auto">
				<table className="w-full min-w-[850px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
						<tr>
							{status === "active" && (
								<th className="w-12 px-4 py-3.5 text-center">
									<input
										type="checkbox"
										checked={isAllSelected}
										ref={(el) => {
											if (el) el.indeterminate = isPartiallySelected;
										}}
										onChange={onToggleSelectAll}
										aria-label="Pilih semua baris pada halaman ini"
										className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
									/>
								</th>
							)}
							<th className="px-5 py-3.5">Siswa</th>
							<th className="px-5 py-3.5">NIM</th>
							<th className="px-5 py-3.5">Kelas</th>
							<th className="px-5 py-3.5">
								{status === "active" ? "Bergabung" : "Dikeluarkan"}
							</th>
							<th className="px-5 py-3.5">Status</th>
							<th className="px-5 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
						{safeRows.map((row) => {
							const studentName =
								row.student?.profile?.fullName ||
								`Siswa #${row.student?.studentNumber || row.studentId.slice(0, 8)}`;
							const studentNim = row.student?.studentNumber || "-";
							const classNameText = row.classes?.name || "Kelas";
							const academicYearText =
								row.classes?.academic_year?.academic_year;
							const dateText = formatIndonesianDate(
								status === "active" ? row.createdAt : row.deletedAt,
							);
							const isChecked = selectedIds.has(row.id);

							return (
								<tr
									key={row.id}
									className={`group transition-colors ${
										isChecked
											? "bg-blue-50/40 dark:bg-blue-950/20"
											: "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
									}`}
								>
									{status === "active" && (
										<td className="px-4 py-4 text-center">
											<input
												type="checkbox"
												checked={isChecked}
												onChange={() => onToggleSelectRow(row.id)}
												aria-label={`Pilih ${studentName}`}
												className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
											/>
										</td>
									)}
									<td className="px-5 py-4">
										<div className="flex items-center gap-3">
											<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
												{getInitials(
													row.student?.profile?.fullName,
													row.student?.studentNumber,
												)}
											</div>
											<div className="min-w-0">
												<div className="truncate font-semibold text-slate-900 dark:text-slate-100">
													{studentName}
												</div>
												{row.student?.profile?.email && (
													<div className="truncate text-xs text-slate-500 dark:text-slate-400">
														{row.student.profile.email}
													</div>
												)}
											</div>
										</div>
									</td>
									<td className="px-5 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">
										{studentNim}
									</td>
									<td className="px-5 py-4">
										<div className="flex flex-wrap items-center gap-1.5">
											<span className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-semibold text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
												{classNameText}
											</span>
											{academicYearText && (
												<span className="text-[11px] text-slate-500 dark:text-slate-400">
													TA {academicYearText}
												</span>
											)}
										</div>
									</td>
									<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
										{dateText}
									</td>
									<td className="px-5 py-4">
										{status === "active" ? (
											<Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-400">
												Aktif
											</Badge>
										) : (
											<Badge className="border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/60 dark:text-red-400">
												Dikeluarkan
											</Badge>
										)}
									</td>
									<td className="px-5 py-4 text-right">
										{status === "active" ? (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => onRemoveSingle(row)}
												className="h-8 border-slate-200 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/30"
												title="Keluarkan dari kelas"
											>
												<UserMinus className="mr-1 size-3.5" />
												Keluarkan
											</Button>
										) : (
											<Button
												type="button"
												variant="outline"
												size="sm"
												disabled={isRestoring}
												onClick={() => onRestore(row)}
												className="h-8 border-slate-200 px-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
												title="Pulihkan ke kelas"
											>
												<RotateCcw className="mr-1 size-3.5" />
												Pulihkan
											</Button>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* 3.8 Footer Paginasi */}
			<div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row">
				{/* Kiri: Menampilkan {a}–{b} dari {n} data */}
				<div className="text-xs text-slate-500 dark:text-slate-400">
					{getPaginationText(currentPage, currentLimit, total)}
				</div>

				{/* Kanan berurutan: Dropdown {n} per halaman, Panah kiri, Kotak halaman aktif biru, Panah kanan */}
				<div className="flex items-center gap-2.5">
					<div className="flex items-center gap-1.5">
						<Select
							id="limit-select"
							value={currentLimit}
							onChange={(e) => onLimitChange(Number(e.target.value))}
							aria-label="Pilih jumlah data per halaman"
							className="h-8 w-24 text-xs dark:bg-slate-950"
						>
							<option value={5}>5 / hal</option>
							<option value={10}>10 / hal</option>
							<option value={20}>20 / hal</option>
							<option value={50}>50 / hal</option>
						</Select>
					</div>

					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage <= 1}
							aria-label="Halaman sebelumnya"
							className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
						>
							<ChevronLeft className="size-4" />
						</button>

						{/* Satu kotak biru penuh berisi nomor halaman aktif saja */}
						<span
							aria-current="page"
							className="flex size-8 select-none items-center justify-center rounded-md bg-blue-600 font-semibold text-xs text-white shadow-sm"
						>
							{currentPage}
						</span>

						<button
							type="button"
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage >= totalPages}
							aria-label="Halaman berikutnya"
							className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
