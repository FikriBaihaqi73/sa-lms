import {
	AlertCircle,
	BookOpen,
	ChevronDown,
	ChevronUp,
	GraduationCap,
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
	onDropSubjectClick: (studyPlan: StudyPlan) => void;
}

export const StudyPlanStudentTable: React.FC<StudyPlanStudentTableProps> = ({
	students,
	isLoading = false,
	isError = false,
	onRetry,
	onAddSubjectClick,
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
			<div className="flex flex-col items-center justify-center rounded-xl border border-red-900/30 bg-red-950/20 p-12 text-center">
				<AlertCircle className="size-10 text-red-400" />
				<h3 className="mt-3 text-sm font-semibold text-white">
					Gagal memuat rekapitulasi KRS siswa
				</h3>
				<p className="mt-1 text-xs text-slate-400">
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
			<div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#111927] p-16 shadow-sm">
				<RefreshCw className="size-8 animate-spin text-blue-500" />
				<p className="mt-3 text-sm font-medium text-slate-400">
					Memuat rekapitulasi SKS dan rencana studi siswa...
				</p>
			</div>
		);
	}

	if (students.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-[#111927] p-16 text-center shadow-sm">
				<GraduationCap className="size-12 text-slate-600" />
				<h3 className="mt-4 text-base font-semibold text-white">
					Tidak ada data siswa
				</h3>
				<p className="mt-1 max-w-sm text-xs text-slate-400">
					Tidak ditemukan siswa yang cocok dengan filter atau belum ada siswa
					terdaftar pada sistem.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-800/90 bg-[#111927] shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-xs">
					<thead>
						<tr className="border-b border-slate-800 bg-[#0d1526] text-slate-400">
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								SISWA / MAHASISWA
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								KELAS / BIDANG
							</th>
							<th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
								MAPEL DIAMBIL
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								BEBAN KREDIT (SKS)
							</th>
							<th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
								STATUS KRS
							</th>
							<th className="px-4 py-3 text-right font-semibold uppercase tracking-wider">
								AKSI
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-slate-800/60">
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
										className="cursor-pointer transition-colors hover:bg-slate-800/30"
									>
										{/* Siswa / Mahasiswa */}
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-900/60 text-xs font-bold text-blue-300 ring-1 ring-blue-500/30">
													{initial}
												</div>
												<div className="min-w-0">
													<p className="truncate font-semibold text-white">
														{student.fullName}
													</p>
													<p className="truncate text-[11px] text-slate-400">
														NIS: {student.studentNumber}{" "}
														{student.email ? `• ${student.email}` : ""}
													</p>
												</div>
											</div>
										</td>

										{/* Kelas / Bidang */}
										<td className="px-4 py-3">
											<p className="font-medium text-slate-200">
												{student.className || "-"}
											</p>
											{student.departmentName && (
												<span className="inline-flex items-center rounded-md border border-purple-500/30 bg-purple-950/40 px-2 py-0.5 text-[10px] text-purple-300">
													{student.departmentName}
												</span>
											)}
										</td>

										{/* Jumlah Mapel Diambil */}
										<td className="px-4 py-3 text-center">
											<span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-bold text-white">
												{student.totalSubjects} Mapel
											</span>
										</td>

										{/* Beban Kredit (SKS) */}
										<td className="min-w-[170px] px-4 py-3">
											<div className="space-y-1.5">
												<div className="flex items-center justify-between text-[11px]">
													<span className="font-semibold text-white">
														{student.totalCredits} SKS
													</span>
													<span className="text-slate-400">
														Maks {student.maxCredits} SKS
													</span>
												</div>
												<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
													<div
														className={`h-full transition-all ${
															isOverLimit
																? "bg-red-500"
																: progressPercent >= 80
																	? "bg-amber-400"
																	: "bg-blue-500"
														}`}
														style={{ width: `${progressPercent}%` }}
													/>
												</div>
											</div>
										</td>

										{/* Status KRS */}
										<td className="px-4 py-3 text-center">
											{student.status === "sudah_krs" ? (
												<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
													<span className="size-1.5 rounded-full bg-emerald-400" />
													Sudah KRS
												</span>
											) : (
												<span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
													<span className="size-1.5 rounded-full bg-rose-400" />
													Belum KRS
												</span>
											)}
										</td>

										{/* Aksi */}
										<td className="px-4 py-3 text-right">
											<div className="flex items-center justify-end gap-2">
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														toggleExpand(student.studentId);
													}}
													className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
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
													className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
												>
													<Plus className="size-3" />
													<span>Mapel</span>
												</button>
											</div>
										</td>
									</tr>

									{/* Expandable Row: Rincian Mapel yang Diambil */}
									{isExpanded && (
										<tr className="bg-[#0e1626]/80">
											<td colSpan={6} className="px-6 py-4">
												<div className="rounded-xl border border-slate-800 bg-[#0a101d] p-4">
													<div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
														<div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
															<BookOpen className="size-3.5 text-blue-400" />
															<span>
																Daftar Mata Pelajaran KRS — {student.fullName}
															</span>
														</div>
														<span className="text-[11px] text-slate-400">
															Total: {student.studyPlans.length} mata pelajaran
															({student.totalCredits} SKS)
														</span>
													</div>

													{student.studyPlans.length === 0 ? (
														<p className="py-4 text-center text-xs text-slate-500">
															Siswa ini belum mengambil mata pelajaran apa pun
															pada tahun ajaran ini. Klik tombol{" "}
															<strong className="text-blue-400">
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
																		className="relative flex flex-col justify-between rounded-lg border border-slate-800/90 bg-[#111927] p-3 text-xs shadow-sm transition-all hover:border-slate-700"
																	>
																		<div>
																			<div className="flex items-start justify-between gap-2">
																				<div>
																					{sub?.code && (
																						<span className="font-mono text-[10px] font-bold text-blue-400">
																							[{sub.code}]
																						</span>
																					)}
																					<h4 className="font-semibold text-white">
																						{sub?.name || "Mata Pelajaran"}
																					</h4>
																				</div>
																				<span className="shrink-0 rounded-full border border-blue-500/30 bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-300">
																					{sub?.credits ?? 0} SKS
																				</span>
																			</div>

																			<div className="mt-2 space-y-1 text-[11px] text-slate-400">
																				<p>
																					Kelas:{" "}
																					<strong className="text-slate-300">
																						{cls?.name || "-"}
																					</strong>
																				</p>
																				<p>
																					Pengajar:{" "}
																					<span className="text-slate-300">
																						{tch?.profile?.fullName || "-"}
																					</span>
																				</p>
																				{dept?.name && (
																					<p>
																						Bidang:{" "}
																						<span className="text-purple-300">
																							{dept.name}
																						</span>
																					</p>
																				)}
																			</div>
																		</div>

																		<div className="mt-3 flex items-center justify-end border-t border-slate-800/70 pt-2">
																			<button
																				type="button"
																				onClick={() => onDropSubjectClick(sp)}
																				className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-950/30 px-2 py-1 text-[11px] font-medium text-rose-400 transition-colors hover:bg-rose-900/40 hover:text-rose-300"
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
