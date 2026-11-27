import {
	AlertCircle,
	BookOpen,
	ChevronDown,
	ChevronUp,
	GraduationCap,
	PackageCheck,
	Plus,
	RefreshCw,
	Trash2,
} from "lucide-react";
import type React from "react";
import { Fragment, useState } from "react";
import type { StudentKrsSummary, StudyPlan } from "../types";

interface StudyPlanStudentTableProps {
	students: StudentKrsSummary[];
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	onAddSubjectClick: (studentId: string) => void;
	onAddBundleClick?: (studentId: string) => void;
	onDropSubjectClick: (studyPlan: StudyPlan) => void;
}

export const StudyPlanStudentTable: React.FC<StudyPlanStudentTableProps> = ({
	students,
	isLoading = false,
	isError = false,
	onRetry,
	onAddSubjectClick,
	onAddBundleClick,
	onDropSubjectClick,
}) => {
	const [expandedStudentIds, setExpandedStudentIds] = useState<Set<string>>(
		new Set(),
	);

	const toggleExpand = (studentId: string) => {
		setExpandedStudentIds((prev) => {
			const next = new Set(prev);
			if (next.has(studentId)) {
				next.delete(studentId);
			} else {
				next.add(studentId);
			}
			return next;
		});
	};

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/30 dark:bg-red-950/20">
				<AlertCircle className="size-10 text-red-500 dark:text-red-400" />
				<h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
					Gagal memuat rekapitulasi KRS siswa
				</h3>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Terjadi kesalahan saat memuat data rencana studi siswa.
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
					Memuat rekapitulasi SKS dan rencana studi siswa...
				</p>
			</div>
		);
	}

	if (students.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm dark:border-slate-800 dark:bg-[#111927]">
				<GraduationCap className="size-12 text-slate-400 dark:text-slate-600" />
				<h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
					Tidak ada data siswa
				</h3>
				<p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
					Tidak ditemukan siswa yang cocok dengan filter atau belum ada siswa
					terdaftar pada sistem.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#111927]">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-xs">
					<thead>
						<tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold tracking-wider text-slate-500 dark:border-slate-800/80 dark:bg-[#0d1526]/90 dark:text-slate-400">
							<th className="px-3.5 py-2.5 uppercase">
								SISWA / MAHASISWA
							</th>
							<th className="px-3.5 py-2.5 uppercase">
								KELAS / BIDANG
							</th>
							<th className="px-3.5 py-2.5 text-center uppercase">
								MAPEL DIAMBIL
							</th>
							<th className="px-3.5 py-2.5 uppercase">
								BEBAN KREDIT (SKS)
							</th>
							<th className="px-3.5 py-2.5 text-center uppercase">
								STATUS KRS
							</th>
							<th className="px-3.5 py-2.5 text-right uppercase">
								AKSI
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
						{students.map((student) => {
							const isExpanded = expandedStudentIds.has(student.studentId);
							const progressPercent = Math.min(
								100,
								Math.round((student.totalCredits / student.maxCredits) * 100),
							);
							const isOverLimit = student.totalCredits > student.maxCredits;

							// Initial for avatar
							const initial = student.fullName.charAt(0).toUpperCase() || "S";

							return (
								<Fragment key={student.studentId}>
									<tr
										onClick={() => toggleExpand(student.studentId)}
										className="cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/25"
									>
										{/* Siswa / Mahasiswa */}
										<td className="px-3.5 py-2.5">
											<div className="flex items-center gap-2.5">
												<div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/30">
													{initial}
												</div>
												<div className="min-w-0">
													<p className="truncate font-semibold text-slate-900 dark:text-white">
														{student.fullName}
													</p>
													<p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
														NIS: {student.studentNumber}{" "}
														{student.email ? `• ${student.email}` : ""}
													</p>
												</div>
											</div>
										</td>

										{/* Kelas / Bidang */}
										<td className="px-3.5 py-2.5">
											<p className="font-medium text-slate-700 dark:text-slate-200">
												{student.className || "-"}
											</p>
											{student.departmentName && (
												<span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
													{student.departmentName}
												</span>
											)}
										</td>

										{/* Jumlah Mapel Diambil */}
										<td className="px-3.5 py-2.5 text-center">
											<span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
												{student.totalSubjects} Mapel
											</span>
										</td>

										{/* Beban Kredit (SKS) */}
										<td className="min-w-[160px] px-3.5 py-2.5">
											<div className="space-y-1">
												<div className="flex items-center justify-between text-[11px]">
													<span className="font-semibold text-slate-900 dark:text-white">
														{student.totalCredits} SKS
													</span>
													<span className="text-slate-400 dark:text-slate-500">
														Maks {student.maxCredits} SKS
													</span>
												</div>
												<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
													<div
														className={`h-full transition-all ${
															isOverLimit
																? "bg-rose-500"
																: progressPercent >= 80
																	? "bg-amber-400"
																	: "bg-blue-600 dark:bg-blue-500"
														}`}
														style={{ width: `${progressPercent}%` }}
													/>
												</div>
											</div>
										</td>

										{/* Status KRS */}
										<td className="px-3.5 py-2.5 text-center">
											{student.status === "sudah_krs" ? (
												<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
													<span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
													Sudah KRS
												</span>
											) : (
												<span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
													<span className="size-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
													Belum KRS
												</span>
											)}
										</td>

										{/* Aksi */}
										<td className="px-3.5 py-2.5 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														toggleExpand(student.studentId);
													}}
													className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200/80 bg-white px-2 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111927] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
												>
													<span>Rincian</span>
													{isExpanded ? (
														<ChevronUp className="size-3" />
													) : (
														<ChevronDown className="size-3" />
													)}
												</button>

												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														onAddSubjectClick(student.studentId);
													}}
													title="Tambah / Force Enroll Mapel untuk Siswa Ini"
													className="inline-flex h-7 items-center gap-1 rounded-md bg-blue-600 px-2.5 text-[11px] font-medium text-white shadow-xs transition-colors hover:bg-blue-500"
												>
													<Plus className="size-3" />
													<span>Mapel</span>
												</button>

												{onAddBundleClick && (
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															onAddBundleClick(student.studentId);
														}}
														title="Ambil Paket KRS Jurusan dalam Semester (Bundle)"
														className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-500/30 bg-blue-50/60 px-2 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
													>
														<PackageCheck className="size-3" />
														<span>+ Paket</span>
													</button>
												)}
											</div>
										</td>
									</tr>

									{/* Expandable Row: Rincian Mapel yang Diambil */}
									{isExpanded && (
										<tr className="bg-slate-50/60 dark:bg-[#0c1322]/60">
											<td colSpan={6} className="px-5 py-3.5">
												<div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800/80 dark:bg-[#0c1322]">
													<div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-2 dark:border-slate-800/80">
														<div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
															<BookOpen className="size-3.5 text-blue-500 dark:text-blue-400" />
															<span>
																Daftar Mata Pelajaran KRS — {student.fullName}
															</span>
														</div>
														<span className="text-[11px] text-slate-400 dark:text-slate-500">
															Total: {student.studyPlans.length} mata pelajaran
															({student.totalCredits} SKS)
														</span>
													</div>

													{student.studyPlans.length === 0 ? (
														<p className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
															Siswa ini belum mengambil mata pelajaran apa pun
															pada tahun ajaran ini. Klik tombol{" "}
															<strong className="text-blue-600 dark:text-blue-400">
																"+ Mapel"
															</strong>{" "}
															untuk menambahkan mata pelajaran.
														</p>
													) : (
														<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
															{student.studyPlans.map((sp) => {
																const sub = sp.classSubject?.subject;
																const cls = sp.classSubject?.class;
																const tch = sp.classSubject?.teacher;
																const dept = sub?.department;

																return (
																	<div
																		key={sp.id}
																		className="relative flex flex-col justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 text-xs transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#111927] dark:hover:border-slate-700/80"
																	>
																		<div>
																			<div className="flex items-start justify-between gap-2">
																				<div>
																					{sub?.code && (
																						<span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
																							[{sub.code}]
																						</span>
																					)}
																					<h4 className="font-semibold text-slate-900 dark:text-white">
																						{sub?.name || "Mata Pelajaran"}
																					</h4>
																				</div>
																				<span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
																					{sub?.credits ?? 0} SKS
																				</span>
																			</div>

																			<div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
																				<p>
																					Kelas:{" "}
																					<strong className="text-slate-700 dark:text-slate-300">
																						{cls?.name || "-"}
																					</strong>
																				</p>
																				<p>
																					Pengajar:{" "}
																					<span className="text-slate-700 dark:text-slate-300">
																						{tch?.profile?.fullName || "-"}
																					</span>
																				</p>
																				{dept?.name && (
																					<p>
																						Bidang:{" "}
																						<span className="font-medium text-slate-600 dark:text-slate-300">
																							{dept.name}
																						</span>
																					</p>
																				)}
																			</div>
																		</div>

																		<div className="mt-2.5 flex items-center justify-end border-t border-slate-200/80 pt-2 dark:border-slate-800/80">
																			<button
																				type="button"
																				onClick={() => onDropSubjectClick(sp)}
																				className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-500/20 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25 transition-colors"
																			>
																				<Trash2 className="size-3" />
																				<span>Drop / Hapus</span>
																			</button>
																		</div>
																	</div>
																);
															})}
														</div>
													)}
												</div>
											</td>
										</tr>
									)}
								</Fragment>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};
