import { Eye } from "lucide-react";
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
	hasAssignment: boolean;
	onPageChange: (newPage: number) => void;
	onLimitChange: (newLimit: number) => void;
	onSelectDetail: (studentId: string) => void;
}

const statusLabels: Record<SubmissionRow["status"], string> = {
	submitted: "Sudah Mengumpulkan",
	late: "Terlambat",
	missing: "Belum Mengumpulkan",
};

const statusBadges: Record<SubmissionRow["status"], string> = {
	submitted: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30",
	late: "bg-amber-950/80 text-amber-300 border border-amber-500/30",
	missing: "bg-rose-950/80 text-rose-300 border border-rose-500/30",
};

const actionBtnClass =
	"inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white";
const navBtnClass =
	"inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40";

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
	hasAssignment,
	onPageChange,
	onLimitChange,
	onSelectDetail,
}) => {
	const start = (currentPage - 1) * limit;

	return (
		<div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/60 shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[1000px] text-left text-sm">
					<caption className="sr-only">Daftar Pengumpulan Siswa</caption>
					<thead className="bg-[#1a2642] text-xs uppercase tracking-wider text-slate-300">
						<tr>
							{[
								"NO",
								"NAMA SISWA",
								"WAKTU PENGUMPULAN",
								"STATUS",
								"NILAI",
								"FEEDBACK",
								"AKSI",
							].map((heading) => (
								<th key={heading} scope="col" className="px-5 py-4 font-bold">
									{heading}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-800">
						{rows.length > 0 ? (
							rows.map((row, index) => {
								const initials = row.fullName
									.trim()
									.split(/\s+/)
									.slice(0, 2)
									.map((p) => p[0])
									.join("")
									.toUpperCase();

								return (
									<tr
										key={row.studentId}
										className="transition-colors hover:bg-slate-800/40"
									>
										<td className="px-5 py-4 text-slate-400">
											{start + index + 1}
										</td>
										<td className="px-5 py-3">
											<div className="flex items-center gap-3">
												<span
													aria-hidden="true"
													className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-900/80 text-xs font-bold text-blue-200 border border-blue-500/30"
												>
													{initials}
												</span>
												<div>
													<p className="font-semibold text-white">
														{row.fullName}
													</p>
													<p className="text-xs text-slate-400">
														NIS: {row.studentNumber ?? "—"}
													</p>
												</div>
											</div>
										</td>
										<td className="px-5 py-3 text-slate-300">
											{submissionDate(row.submittedAt)}
										</td>
										<td className="px-5 py-3">
											<span
												className={`inline-block whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${statusBadges[row.status]}`}
											>
												{statusLabels[row.status]}
											</span>
										</td>
										<td className="px-5 py-3 font-semibold text-white">
											{row.score ?? "—"}
										</td>
										<td className="max-w-48 truncate px-5 py-3 text-slate-300">
											{row.feedback ?? "—"}
										</td>
										<td className="px-5 py-3">
											<button
												type="button"
												className={actionBtnClass}
												aria-label={`Detail ${row.fullName}`}
												onClick={() => onSelectDetail(row.studentId)}
											>
												<Eye className="size-3.5" /> Detail
											</button>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td colSpan={7} className="px-5 py-16 text-center">
									<p
										role={isErrorState ? "alert" : "status"}
										className="text-sm text-slate-400"
									>
										{emptyMessage}
									</p>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300 sm:text-sm">
				<p>
					{hasAssignment
						? `Menampilkan ${totalData ? start + 1 : 0}–${Math.min(start + limit, totalData)} dari ${totalData} data`
						: "Belum ada data yang dapat ditampilkan"}
				</p>
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-1.5 text-xs text-slate-400">
						<span>Per halaman:</span>
						<select
							aria-label="Baris per halaman"
							className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white"
							value={limit}
							onChange={(e) => onLimitChange(Number(e.target.value))}
						>
							{[5, 10, 25, 50].map((v) => (
								<option key={v} value={v}>
									{v}
								</option>
							))}
						</select>
					</label>

					<div className="flex items-center gap-1">
						<button
							type="button"
							className={navBtnClass}
							disabled={!hasAssignment || currentPage <= 1}
							onClick={() => onPageChange(currentPage - 1)}
						>
							Sebelumnya
						</button>
						<span
							aria-current="page"
							className="rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white"
						>
							{currentPage}
						</span>
						<button
							type="button"
							className={navBtnClass}
							disabled={!hasAssignment || currentPage >= totalPages}
							onClick={() => onPageChange(currentPage + 1)}
						>
							Berikutnya
						</button>
					</div>
				</div>
			</footer>
		</div>
	);
};
