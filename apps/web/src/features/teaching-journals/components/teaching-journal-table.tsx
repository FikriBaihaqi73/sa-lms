import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScheduleOption, TeachingJournal } from "../types";

interface TeachingJournalTableProps {
	rows: TeachingJournal[];
	totalData: number;
	currentPage: number;
	totalPages: number;
	perPage: number;
	isLoading: boolean;
	isError: boolean;
	searchTerm?: string;
	scheduleMap?: Record<string, ScheduleOption>;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onRetry: () => void;
	onDetail: (item: TeachingJournal) => void;
	onEdit: (item: TeachingJournal) => void;
	onDelete: (item: TeachingJournal) => void;
	onCreateNew?: () => void;
}

function formatDate(dateStr: string | null | undefined): string {
	if (!dateStr) return "—";
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("id-ID", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export const TeachingJournalTable: React.FC<TeachingJournalTableProps> = ({
	rows,
	totalData,
	currentPage,
	totalPages,
	perPage,
	isLoading,
	isError,
	searchTerm,
	scheduleMap = {},
	onPageChange,
	onLimitChange,
	onRetry,
	onDetail,
	onEdit,
	onDelete,
	onCreateNew,
}) => {
	if (isLoading) {
		return (
			<div className="space-y-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
				{[1, 2, 3, 4, 5].map((item) => (
					<div
						key={item}
						className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
				<p className="font-semibold">Gagal memuat daftar jurnal mengajar</p>
				<p className="mt-1 text-sm opacity-90">
					Terjadi kendala saat mengambil data dari server. Silakan coba lagi.
				</p>
				<Button variant="outline" className="mt-3" onClick={onRetry}>
					Coba Lagi
				</Button>
			</div>
		);
	}

	if (rows.length === 0) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
				<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
					<FileText className="size-6" />
				</div>
				<p className="text-base font-semibold text-slate-800 dark:text-slate-200">
					{searchTerm
						? "Data jurnal tidak ditemukan"
						: "Belum ada catatan jurnal mengajar"}
				</p>
				<p className="mt-1 text-sm">
					{searchTerm
						? "Coba ubah kata kunci pencarian atau sesuaikan filter jadwal/tanggal."
						: "Mulai catat pelaksanaan materi dan aktivitas pembelajaran kelas."}
				</p>
				{onCreateNew && !searchTerm && (
					<Button
						type="button"
						onClick={onCreateNew}
						className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
					>
						+ Tambah Jurnal Sekarang
					</Button>
				)}
			</div>
		);
	}

	const startIdx = totalData > 0 ? (currentPage - 1) * perPage + 1 : 0;
	const endIdx = Math.min(currentPage * perPage, totalData);

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[960px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
						<tr>
							<th className="px-5 py-3.5">PERTEMUAN</th>
							<th className="px-5 py-3.5">JADWAL & KELAS</th>
							<th className="px-5 py-3.5">TANGGAL</th>
							<th className="px-5 py-3.5">TOPIK & MATERI</th>
							<th className="px-5 py-3.5">PENGAMPU / PENCATAT</th>
							<th className="px-5 py-3.5">CATATAN</th>
							<th className="px-5 py-3.5 text-right">AKSI</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
						{rows.map((item) => {
							const schOpt = scheduleMap[item.schedule_id];
							const subjectName =
								item.schedule?.classSubject?.subject?.name ??
								schOpt?.subjectName ??
								"Mata Pelajaran";
							const className =
								item.schedule?.classSubject?.class?.name ??
								schOpt?.className ??
								"Kelas";
							const day = item.schedule?.day ?? schOpt?.day ?? "";
							const teacherName =
								item.schedule?.classSubject?.teacher?.profile?.fullName ??
								schOpt?.teacherName ??
								item.createdBy?.profile?.fullName ??
								item.createdBy?.name ??
								"—";
							const roomName =
								item.schedule?.classroom?.roomName ?? schOpt?.roomName ?? "";

							return (
								<tr
									key={item.id}
									className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
								>
									{/* Kolom Pertemuan */}
									<td className="px-5 py-4">
										<Badge
											variant="outline"
											className="border-slate-700 bg-slate-800 font-mono text-xs text-blue-400 dark:bg-slate-950/80"
										>
											{item.meeting_number !== null &&
											item.meeting_number !== undefined
												? `#${item.meeting_number}`
												: "#—"}
										</Badge>
									</td>

									{/* Kolom Jadwal & Kelas */}
									<td className="px-5 py-4">
										<div className="font-semibold text-slate-900 dark:text-slate-100">
											{subjectName}
										</div>
										<div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
											<span className="font-medium text-slate-700 dark:text-slate-300">
												{className}
											</span>
											{day && (
												<>
													<span>•</span>
													<span>{day}</span>
												</>
											)}
											{roomName && (
												<>
													<span>•</span>
													<span>{roomName}</span>
												</>
											)}
										</div>
									</td>

									{/* Kolom Tanggal */}
									<td className="px-5 py-4 text-slate-600 dark:text-slate-300">
										{formatDate(item.journal_date)}
									</td>

									{/* Kolom Topik & Materi */}
									<td className="max-w-xs px-5 py-4">
										<div className="truncate font-medium text-slate-900 dark:text-slate-100">
											{item.topic || "—"}
										</div>
										<div
											className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400"
											title={item.material ?? ""}
										>
											{item.material || "Tidak ada rincian materi"}
										</div>
									</td>

									{/* Kolom Pengampu / Pencatat */}
									<td className="px-5 py-4 text-slate-700 dark:text-slate-300">
										<div className="font-medium">{teacherName}</div>
										{item.createdBy?.email && (
											<div className="text-xs text-slate-400 dark:text-slate-500">
												{item.createdBy.email}
											</div>
										)}
									</td>

									{/* Kolom Catatan */}
									<td className="px-5 py-4">
										{item.notes?.trim() ? (
											<Badge
												variant="secondary"
												className="border border-emerald-800/40 bg-emerald-950/40 text-xs text-emerald-400 hover:bg-emerald-950/60"
												title={item.notes}
											>
												Ada catatan
											</Badge>
										) : (
											<span className="text-xs text-slate-400 dark:text-slate-600">
												—
											</span>
										)}
									</td>

									{/* Kolom Aksi */}
									<td className="px-5 py-4 text-right">
										<div className="flex items-center justify-end gap-3 opacity-90 transition-opacity group-hover:opacity-100">
											<button
												type="button"
												onClick={() => onDetail(item)}
												className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
												title="Lihat Detail Jurnal"
											>
												Detail
											</button>
											<button
												type="button"
												onClick={() => onEdit(item)}
												className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
												title="Ubah Jurnal"
											>
												Ubah
											</button>
											<button
												type="button"
												onClick={() => onDelete(item)}
												className="text-xs font-medium text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
												title="Hapus Jurnal"
											>
												Hapus
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Footer Pagination */}
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
						{totalData}
					</span>{" "}
					data
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<span>Per halaman:</span>
						<select
							value={perPage}
							onChange={(e) => onLimitChange(Number(e.target.value))}
							className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
						>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
						</select>
					</div>

					<div className="flex items-center gap-1">
						<button
							type="button"
							disabled={currentPage <= 1}
							onClick={() => onPageChange(currentPage - 1)}
							className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
							title="Halaman Sebelumnya"
						>
							<ChevronLeft className="size-4" />
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1)
							.filter(
								(p) =>
									p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
							)
							.map((p, idx, arr) => {
								const prev = arr[idx - 1];
								const showEllipsis = prev && p - prev > 1;

								return (
									<React.Fragment key={p}>
										{showEllipsis && (
											<span className="px-1 text-slate-400">...</span>
										)}
										<button
											type="button"
											onClick={() => onPageChange(p)}
											className={`min-w-7 rounded-md px-2 py-1 text-xs font-medium ${
												p === currentPage
													? "bg-blue-600 text-white dark:bg-blue-600"
													: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
											}`}
										>
											{p}
										</button>
									</React.Fragment>
								);
							})}

						<button
							type="button"
							disabled={currentPage >= totalPages}
							onClick={() => onPageChange(currentPage + 1)}
							className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
							title="Halaman Berikutnya"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
