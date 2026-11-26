import { Eye, FileText } from "lucide-react";
import type React from "react";
import type { SubmissionRow } from "../types";
import { submissionDate } from "../utils";

interface AssignmentSubmissionsTableProps {
	rows: SubmissionRow[];
	currentPage: number;
	limit: number;
	totalPages: number;
	totalData: number;
	emptyMessage: string;
	isErrorState?: boolean;
	onPageChange: (newPage: number) => void;
	onLimitChange: (newLimit: number) => void;
	onSelectDetail: (row: SubmissionRow) => void;
}

const actionBtnClass =
	"inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white";
const navBtnClass =
	"inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const AssignmentSubmissionsTable: React.FC<
	AssignmentSubmissionsTableProps
> = ({
	rows,
	currentPage,
	limit,
	totalPages,
	totalData,
	emptyMessage,
	isErrorState = false,
	onPageChange,
	onLimitChange,
	onSelectDetail,
}) => {
	const start = (currentPage - 1) * limit;

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[960px] text-left text-xs">
					<caption className="sr-only">Daftar Hasil Pengumpulan Tugas</caption>
					<thead className="border-b border-slate-200 bg-slate-100/80 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-[#080d18] dark:text-slate-400">
						<tr>
							{[
								"NO",
								"SISWA & KELAS",
								"MATA PELAJARAN & TUGAS",
								"HASIL TUGAS DIKIRIM",
								"WAKTU KIRIM",
								"NILAI & PENILAIAN",
								"AKSI",
							].map((heading) => (
								<th key={heading} scope="col" className="px-4 py-3 font-bold">
									{heading}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/60 dark:text-slate-300">
						{rows.length > 0 ? (
							rows.map((row, index) => {
								const initials = row.fullName
									.trim()
									.split(/\s+/)
									.slice(0, 2)
									.map((p) => p[0])
									.join("")
									.toUpperCase();
								const isGraded = row.score !== null && row.score !== undefined;

								return (
									<tr
										key={row.id || `${row.studentId}-${index}`}
										className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
									>
										<td className="px-4 py-3 text-slate-500 dark:text-slate-400">
											{start + index + 1}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2.5">
												<span
													aria-hidden="true"
													className="flex size-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 dark:border-blue-500/40 dark:bg-blue-950/60 dark:text-blue-300"
												>
													{initials}
												</span>
												<div>
													<p className="font-semibold text-slate-900 dark:text-white">
														{row.fullName}
													</p>
													<div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
														<span>NIS: {row.studentNumber ?? "—"}</span>
														{row.className && (
															<span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
																{row.className}
															</span>
														)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											<p className="font-semibold text-slate-900 dark:text-slate-100">
												{row.assignmentTitle || "Tugas"}
											</p>
											<p className="mt-0.5 text-[11px] text-blue-600 dark:text-blue-400">
												{row.subjectName || "Mata Pelajaran"}
											</p>
										</td>
										<td className="max-w-[260px] px-4 py-3">
											<div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
												<FileText className="size-3.5 shrink-0" />
												<span className="truncate">
													{row.fileName || "Lampiran Jawaban"}
												</span>
											</div>
											{row.answerText && (
												<p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
													{row.answerText}
												</p>
											)}
										</td>
										<td className="px-4 py-3">
											<p className="text-xs text-slate-700 dark:text-slate-200">
												{submissionDate(row.submittedAt)}
											</p>
											<span
												className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
													row.status === "late"
														? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/70 dark:text-amber-300"
														: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/70 dark:text-emerald-300"
												}`}
											>
												{row.status === "late" ? "Terlambat" : "Tepat Waktu"}
											</span>
										</td>
										<td className="px-4 py-3">
											{isGraded ? (
												<div>
													<p className="font-bold text-slate-900 dark:text-white">
														{row.score}{" "}
														<span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
															/ {row.maxScore ?? 100}
														</span>
													</p>
													<span className="mt-0.5 inline-block text-[11px] text-emerald-600 dark:text-emerald-400">
														Sudah Dinilai
													</span>
												</div>
											) : (
												<span className="inline-block rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300">
													Menunggu Penilaian
												</span>
											)}
										</td>
										<td className="px-4 py-3">
											<button
												type="button"
												onClick={() => onSelectDetail(row)}
												aria-label={`Lihat hasil ${row.fullName}`}
												className={actionBtnClass}
											>
												<Eye className="size-3.5" aria-hidden="true" />
												<span>Lihat Hasil</span>
											</button>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td
									colSpan={7}
									className="px-4 py-10 text-center text-xs text-slate-500 dark:text-slate-400"
								>
									<span role={isErrorState ? "alert" : "status"}>
										{emptyMessage}
									</span>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{totalData > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
					<div className="flex items-center gap-2">
						<span>Tampilkan</span>
						<select
							aria-label="Baris per halaman"
							value={limit}
							onChange={(e) => onLimitChange(Number(e.target.value))}
							className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
						>
							{[5, 10, 20, 50].map((val) => (
								<option key={val} value={val}>
									{val}
								</option>
							))}
						</select>
						<span>dari {totalData} hasil tugas</span>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => onPageChange(Math.max(1, currentPage - 1))}
							disabled={currentPage <= 1}
							className={navBtnClass}
						>
							Sebelumnya
						</button>
						<span className="px-2 font-medium text-slate-700 dark:text-slate-200">
							Halaman {currentPage} dari {totalPages}
						</span>
						<button
							type="button"
							onClick={() =>
								onPageChange(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage >= totalPages}
							className={navBtnClass}
						>
							Berikutnya
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
