import { Edit3, Eye, FileText, Plus } from "lucide-react";
import type React from "react";
import type {
	ExaminationScoreItem,
	StandardGrade,
	StudentParticipant,
} from "../types";
import {
	formatDateTime,
	formatScore,
	resolveGradeFromScore,
} from "../utils/grade-resolver";

interface ExaminationScoresTableProps {
	students: StudentParticipant[];
	grades: StandardGrade[];
	onOpenInputForStudent: (student: StudentParticipant) => void;
	onOpenAuditForStudent: (
		scoreItem: ExaminationScoreItem,
		student: StudentParticipant,
	) => void;
	isLoading?: boolean;
}

export const ExaminationScoresTable: React.FC<ExaminationScoresTableProps> = ({
	students,
	grades,
	onOpenInputForStudent,
	onOpenAuditForStudent,
	isLoading = false,
}) => {
	if (isLoading) {
		return (
			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="h-12 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50"
						/>
					))}
				</div>
			</div>
		);
	}

	if (students.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#111927]/60">
				<FileText className="size-10 text-slate-400 dark:text-slate-600" />
				<h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
					Tidak ada data siswa ditemukan
				</h3>
				<p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
					Tidak ada siswa yang cocok dengan filter pencarian atau belum ada
					siswa yang terdaftar pada kelas ini.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-xs">
					<thead className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-[#0c1322]/80 dark:text-slate-400">
						<tr>
							<th scope="col" className="px-4 py-3.5">
								Siswa / Mahasiswa
							</th>
							<th scope="col" className="px-4 py-3.5 text-center">
								Skor (Score)
							</th>
							<th scope="col" className="px-4 py-3.5 text-center">
								Predikat (Grade)
							</th>
							<th scope="col" className="px-4 py-3.5">
								Catatan Penguji
							</th>
							<th scope="col" className="px-4 py-3.5">
								Penilai & Waktu
							</th>
							<th scope="col" className="px-4 py-3.5 text-right">
								Aksi
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
						{students.map((student) => {
							const scoreRecord = student.scoreRecord;
							const hasScore =
								scoreRecord !== null &&
								scoreRecord !== undefined &&
								scoreRecord.score !== null;
							const numericScore = hasScore ? scoreRecord.score : null;
							const gradeResult = resolveGradeFromScore(numericScore, grades);

							const initials = student.fullName
								.split(" ")
								.map((n) => n[0])
								.slice(0, 2)
								.join("")
								.toUpperCase();

							const graderName =
								scoreRecord?.grader?.profile?.fullName ||
								scoreRecord?.grader?.email ||
								(hasScore ? "Penguji / Admin" : "-");

							return (
								<tr
									key={student.studentId}
									className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
								>
									{/* 1. Siswa / Mahasiswa */}
									<td className="px-4 py-3.5">
										<div className="flex items-center gap-3">
											<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100/80 font-bold text-xs text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
												{initials}
											</div>
											<div className="min-w-0">
												<p className="font-bold text-slate-900 dark:text-white">
													{student.fullName}
												</p>
												<p className="text-[11px] text-slate-500 dark:text-slate-400">
													NIS: {student.studentNumber}
												</p>
											</div>
										</div>
									</td>

									{/* 2. Skor */}
									<td className="px-4 py-3.5 text-center">
										{hasScore ? (
											<span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
												{formatScore(numericScore)}
											</span>
										) : (
											<span className="font-medium text-slate-400 dark:text-slate-500">
												-
											</span>
										)}
									</td>

									{/* 3. Predikat */}
									<td className="px-4 py-3.5 text-center">
										<span
											title={
												gradeResult.description
													? `${gradeResult.description} (Rentang: ${gradeResult.scoreRangeText})`
													: undefined
											}
											className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${gradeResult.colorBadge.bg} ${gradeResult.colorBadge.text} ${gradeResult.colorBadge.border}`}
										>
											{gradeResult.grade}
										</span>
									</td>

									{/* 4. Catatan Penguji */}
									<td className="max-w-[200px] truncate px-4 py-3.5 text-slate-600 dark:text-slate-300">
										{scoreRecord?.notes ? (
											<span title={scoreRecord.notes}>{scoreRecord.notes}</span>
										) : (
											<span className="italic text-slate-400 dark:text-slate-500">
												Tidak ada catatan
											</span>
										)}
									</td>

									{/* 5. Penilai & Waktu */}
									<td className="px-4 py-3.5">
										{hasScore ? (
											<div>
												<p className="font-semibold text-slate-800 dark:text-slate-200">
													{graderName}
												</p>
												<p className="text-[11px] text-slate-400 dark:text-slate-500">
													{formatDateTime(scoreRecord?.gradedAt)}
												</p>
											</div>
										) : (
											<span className="text-slate-400 dark:text-slate-500">
												-
											</span>
										)}
									</td>

									{/* 6. Aksi */}
									<td className="px-4 py-3.5 text-right">
										<div className="flex items-center justify-end gap-1.5">
											{hasScore && scoreRecord && (
												<button
													type="button"
													onClick={() =>
														onOpenAuditForStudent(scoreRecord, student)
													}
													title="Lihat Metadata Audit"
													className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
												>
													<Eye className="size-3.5" />
												</button>
											)}

											<button
												type="button"
												onClick={() => onOpenInputForStudent(student)}
												className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
													hasScore
														? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
														: "bg-blue-600 text-white hover:bg-blue-500"
												}`}
											>
												{hasScore ? (
													<>
														<Edit3 className="size-3" />
														<span>Edit Nilai</span>
													</>
												) : (
													<>
														<Plus className="size-3" />
														<span>Input Nilai</span>
													</>
												)}
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};
