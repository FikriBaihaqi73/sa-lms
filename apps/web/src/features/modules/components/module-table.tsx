import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	FileText,
	Lock,
	Unlock,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClassSubjectOption, LearningModule } from "../types";

interface ModuleTableProps {
	rows: LearningModule[];
	totalData: number;
	currentPage: number;
	totalPages: number;
	perPage: number;
	isLoading: boolean;
	isError: boolean;
	searchTerm?: string;
	classSubjectMap?: Record<string, ClassSubjectOption>;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onRetry: () => void;
	onDetail: (item: LearningModule) => void;
	onEdit: (item: LearningModule) => void;
	onDelete: (item: LearningModule) => void;
	onCreateNew?: () => void;
}

export const ModuleTable: React.FC<ModuleTableProps> = ({
	rows,
	totalData,
	currentPage,
	totalPages,
	perPage,
	isLoading,
	isError,
	searchTerm,
	classSubjectMap = {},
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
			<div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton placeholder
						<div key={i} className="flex items-center justify-between gap-4">
							<div className="h-6 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
							<div className="h-6 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
							<div className="h-6 w-1/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
							<div className="h-6 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
				<p className="text-sm font-semibold text-red-600 dark:text-red-400">
					Gagal memuat data modul pembelajaran.
				</p>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Terjadi kendala saat menyambung ke server institusi.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onRetry}
					className="mt-4 border-slate-200 dark:border-slate-700"
				>
					Coba Lagi
				</Button>
			</div>
		);
	}

	if (rows.length === 0) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
					<BookOpen className="size-6" />
				</div>
				<h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
					{searchTerm
						? "Tidak ada modul yang cocok"
						: "Belum ada data modul pembelajaran"}
				</h3>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					{searchTerm
						? "Coba gunakan kata kunci pencarian yang lain."
						: "Mulai buat silabus dan modul pembelajaran untuk kelas dan mata pelajaran institusi."}
				</p>
				{onCreateNew && !searchTerm && (
					<Button
						type="button"
						size="sm"
						onClick={onCreateNew}
						className="mt-4 bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-sm hover:from-blue-800 hover:to-indigo-700"
					>
						+ Tambah Modul Pertama
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
					<thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
						<tr>
							<th className="px-4 py-3.5">Urutan & Judul</th>
							<th className="px-4 py-3.5">Mapel & Kelas</th>
							<th className="px-4 py-3.5">Konten</th>
							<th className="px-4 py-3.5">Status Akses</th>
							<th className="px-4 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{rows.map((item) => {
							const classSubjectInfo =
								classSubjectMap[item.class_subject_id];
							const className =
								item.class_subject?.class?.name ||
								classSubjectInfo?.className ||
								"Kelas";
							const subjectName =
								item.class_subject?.subject?.name ||
								classSubjectInfo?.subjectName ||
								"Mata Pelajaran";
							const teacherName =
								item.class_subject?.teacher?.profile?.fullName ||
								item.class_subject?.teacher?.teacher_number ||
								classSubjectInfo?.teacherName ||
								"Guru Pengampu";

							const contentCount =
								item.moduleContents?.length ?? 0;
							const assignmentCount =
								item.assignments?.length ?? 0;

							return (
								<tr
									key={item.id}
									className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
								>
									<td className="px-4 py-3.5">
										<div className="flex items-start gap-3">
											<span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
												{item.display_order ?? "—"}
											</span>
											<div className="min-w-0">
												<p className="font-semibold text-slate-900 dark:text-white">
													{item.title}
												</p>
												{item.description ? (
													<p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
														{item.description}
													</p>
												) : (
													<p className="mt-0.5 text-xs italic text-slate-400">
														Tidak ada deskripsi tambahan
													</p>
												)}
											</div>
										</div>
									</td>

									<td className="px-4 py-3.5">
										<div className="space-y-0.5">
											<p className="font-medium text-slate-800 dark:text-slate-200">
												{subjectName}
											</p>
											<div className="flex items-center gap-1.5 text-xs text-slate-400">
												<span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
													{className}
												</span>
												<span>•</span>
												<span>{teacherName}</span>
											</div>
										</div>
									</td>

									<td className="px-4 py-3.5">
										<div className="flex items-center gap-2">
											<span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
												<FileText className="size-3.5 text-blue-500" />
												{contentCount} materi
											</span>
											{assignmentCount > 0 && (
												<span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
													<BookOpen className="size-3.5 text-violet-500" />
													{assignmentCount} tugas
												</span>
											)}
										</div>
									</td>

									<td className="px-4 py-3.5">
										<div className="flex flex-wrap items-center gap-1.5">
											{item.is_published ? (
												<Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
													Diterbitkan
												</Badge>
											) : (
												<Badge variant="outline" className="text-slate-500 border-slate-300 dark:border-slate-700">
													Draf
												</Badge>
											)}

											{item.is_locked ? (
												<Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800 gap-1">
													<Lock className="size-3" /> Terkunci
												</Badge>
											) : (
												<Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800 gap-1">
													<Unlock className="size-3" /> Terbuka
												</Badge>
											)}
										</div>
									</td>

									<td className="px-4 py-3.5 text-right">
										<div className="flex items-center justify-end gap-1.5">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onDetail(item)}
												className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
											>
												Detail
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onEdit(item)}
												className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
											>
												Ubah
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onDelete(item)}
												className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
											>
												Hapus
											</Button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			<div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row">
				<div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
					<span>Tampilkan</span>
					<select
						value={perPage}
						onChange={(e) => onLimitChange(Number(e.target.value))}
						className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
					<span>data dari total {totalData} modul</span>
				</div>

				<div className="flex items-center gap-1.5">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage <= 1}
						className="h-8 gap-1 px-2.5 text-xs border-slate-200 dark:border-slate-800 disabled:opacity-50"
					>
						<ChevronLeft className="size-3.5" />
						Sebelumnya
					</Button>
					<span className="px-2 text-xs text-slate-500 dark:text-slate-400">
						Halaman {currentPage} dari {Math.max(totalPages, 1)}
					</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
						className="h-8 gap-1 px-2.5 text-xs border-slate-200 dark:border-slate-800 disabled:opacity-50"
					>
						Berikutnya
						<ChevronRight className="size-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
};

