import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Edit2,
	FileText,
	RefreshCw,
	Trash2,
} from "lucide-react";
import type React from "react";
import type { StudyPlan, StudyPlanMeta } from "../types";

interface StudyPlanLogTableProps {
	studyPlans: StudyPlan[];
	meta?: StudyPlanMeta;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	onEdit: (studyPlan: StudyPlan) => void;
	onDelete: (studyPlan: StudyPlan) => void;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

export const StudyPlanLogTable: React.FC<StudyPlanLogTableProps> = ({
	studyPlans,
	meta,
	isLoading = false,
	isError = false,
	onRetry,
	onEdit,
	onDelete,
	onPageChange,
	onLimitChange,
}) => {
	const currentPage = meta?.currentPage ?? 1;
	const totalPages = meta?.totalPages ?? 1;
	const totalData = meta?.totalData ?? studyPlans.length;
	const perPage = meta?.perPage ?? 10;

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/30 dark:bg-red-950/20">
				<AlertCircle className="size-10 text-red-500 dark:text-red-400" />
				<h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
					Gagal memuat log transaksi KRS
				</h3>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Terjadi kesalahan saat memuat data transaksi rencana studi.
				</p>
				{onRetry && (
					<button
						type="button"
						onClick={onRetry}
						className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
					>
						<RefreshCw className="size-3.5" />
						Coba Lagi
					</button>
				)}
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-16 shadow-sm dark:border-slate-800 dark:bg-[#111927]">
				<RefreshCw className="size-8 animate-spin text-blue-500" />
				<p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
					Memuat log transaksi rencana studi...
				</p>
			</div>
		);
	}

	if (studyPlans.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm dark:border-slate-800 dark:bg-[#111927]">
				<FileText className="size-12 text-slate-400 dark:text-slate-600" />
				<h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
					Belum ada transaksi KRS
				</h3>
				<p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
					Belum ada catatan pengambilan rencana studi yang cocok dengan filter.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-xs">
					<thead>
						<tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600 dark:border-slate-800 dark:bg-[#0d1526] dark:text-slate-400">
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								SISWA / MAHASISWA
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								KODE MAPEL
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								MATA PELAJARAN & KELAS
							</th>
							<th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
								KREDIT (SKS)
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								PENGAJAR
							</th>
							<th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
								TAHUN AJARAN
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								TANGGAL DIBUAT
							</th>
							<th className="px-4 py-3 text-right font-semibold uppercase tracking-wider">
								AKSI
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
						{studyPlans.map((sp) => {
							const studentName =
								sp.student?.profile?.fullName ||
								`Siswa #${sp.student?.studentNumber || "-"}`;
							const studentNis = sp.student?.studentNumber || "-";
							const subCode = sp.classSubject?.subject?.code || "-";
							const subName =
								sp.classSubject?.subject?.name || "Mata Pelajaran";
							const clsName = sp.classSubject?.class?.name || "Kelas";
							const deptName =
								sp.classSubject?.subject?.department?.name || null;
							const credits = sp.classSubject?.subject?.credits ?? 0;
							const teacherName =
								sp.classSubject?.teacher?.profile?.fullName || "-";
							const ayName =
								sp.academicYear?.academic_year ||
								sp.classSubject?.academic_year?.academic_year ||
								"-";
							const isAyActive =
								sp.academicYear?.is_active ??
								sp.classSubject?.academic_year?.is_active ??
								false;

							const createdDate = sp.created_at
								? new Date(sp.created_at).toLocaleDateString("id-ID", {
										day: "2-digit",
										month: "short",
										year: "numeric",
									})
								: "-";

							return (
								<tr
									key={sp.id}
									className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
								>
									{/* Siswa / Mahasiswa */}
									<td className="px-4 py-3">
										<p className="font-semibold text-slate-900 dark:text-white">
											{studentName}
										</p>
										<p className="text-[11px] text-slate-500 dark:text-slate-400">
											NIS: {studentNis}
										</p>
									</td>

									{/* Kode Mapel */}
									<td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
										{subCode}
									</td>

									{/* Mata Pelajaran & Kelas */}
									<td className="px-4 py-3">
										<p className="font-semibold text-slate-800 dark:text-slate-200">
											{subName}
										</p>
										<div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
											<span>Kelas: {clsName}</span>
											{deptName && (
												<>
													<span>•</span>
													<span className="font-medium text-purple-600 dark:text-purple-300">
														{deptName}
													</span>
												</>
											)}
										</div>
									</td>

									{/* Kredit (SKS) */}
									<td className="px-4 py-3 text-center">
										<span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-950/60 dark:text-blue-300">
											{credits} SKS
										</span>
									</td>

									{/* Pengajar */}
									<td className="px-4 py-3">
										<span className="font-medium text-slate-700 dark:text-slate-300">
											{teacherName}
										</span>
									</td>

									{/* Tahun Ajaran */}
									<td className="px-4 py-3 text-center">
										<span
											className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
												isAyActive
													? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400"
													: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
											}`}
										>
											{isAyActive && (
												<span className="size-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
											)}
											<span>{ayName}</span>
										</span>
									</td>

									{/* Tanggal Dibuat */}
									<td className="px-4 py-3 text-slate-500 dark:text-slate-400">
										{createdDate}
									</td>

									{/* Aksi */}
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-1.5">
											<button
												type="button"
												onClick={() => onEdit(sp)}
												title="Ubah Rencana Studi"
												className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/80 dark:bg-transparent dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
											>
												<Edit2 className="size-3.5" />
											</button>

											<button
												type="button"
												onClick={() => onDelete(sp)}
												title="Hapus Rencana Studi"
												className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
											>
												<Trash2 className="size-3.5" />
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Pagination Footer */}
			<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0d1526] dark:text-slate-400">
				<div className="flex items-center gap-2">
					<span>Baris per halaman:</span>
					<select
						value={perPage}
						onChange={(e) => onLimitChange(Number(e.target.value))}
						className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#0d1526] dark:text-slate-200"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>
					<span className="ml-2">
						Menampilkan{" "}
						<strong className="text-slate-900 dark:text-white">
							{studyPlans.length}
						</strong>{" "}
						dari{" "}
						<strong className="text-slate-900 dark:text-white">
							{totalData}
						</strong>{" "}
						transaksi
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span>
						Halaman{" "}
						<strong className="text-slate-900 dark:text-white">
							{currentPage}
						</strong>{" "}
						dari{" "}
						<strong className="text-slate-900 dark:text-white">
							{totalPages}
						</strong>
					</span>
					<button
						type="button"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage <= 1}
						className="flex size-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-[#0d1526] dark:text-slate-300 dark:hover:bg-slate-800"
					>
						<ChevronLeft className="size-4" />
					</button>
					<button
						type="button"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
						className="flex size-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-[#0d1526] dark:text-slate-300 dark:hover:bg-slate-800"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			</div>
		</div>
	);
};
