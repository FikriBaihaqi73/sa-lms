import {
	BookOpen,
	Calendar,
	CheckCircle2,
	Clock,
	FileText,
} from "lucide-react";
import type React from "react";
import type { ExaminationOption } from "../types";
import { formatDateOnly } from "../utils/grade-resolver";

interface ExaminationCardSelectorProps {
	examinations: ExaminationOption[];
	selectedExamId: string | null;
	onSelectExam: (exam: ExaminationOption) => void;
	gradedCountMap?: Record<string, { graded: number; total: number }>;
	classNameText?: string;
	isLoading?: boolean;
}

export const ExaminationCardSelector: React.FC<
	ExaminationCardSelectorProps
> = ({
	examinations,
	selectedExamId,
	onSelectExam,
	gradedCountMap = {},
	classNameText = "Kelas Terpilih",
	isLoading = false,
}) => {
	return (
		<div className="space-y-3">
			{/* Header Bar */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800/80">
				<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
					<BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
					<span>
						MATA UJIAN DI {classNameText} ({examinations.length} UJIAN)
					</span>
				</div>
				<span className="text-[11px] text-slate-500 dark:text-slate-400">
					Klik salah satu kartu ujian untuk memuat peserta & kelola nilai
				</span>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111927]/60"
						/>
					))}
				</div>
			) : examinations.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#111927]/50">
					<FileText className="size-9 text-slate-400 dark:text-slate-600" />
					<h3 className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-white">
						Belum ada mata ujian terdaftar
					</h3>
					<p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
						Tidak ditemukan ujian untuk kelas dan tahun ajaran yang dipilih.
						Pilih kelas lain atau tambahkan ujian baru.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{examinations.map((exam) => {
						const isSelected = exam.id === selectedExamId;
						const subjectName =
							exam.classSubject?.subject?.name ?? "Mata Pelajaran";
						const progress = gradedCountMap[exam.id] ?? { graded: 0, total: 0 };
						const isComplete =
							progress.total > 0 && progress.graded >= progress.total;

						return (
							<button
								type="button"
								key={exam.id}
								onClick={() => onSelectExam(exam)}
								className={`group relative flex w-full cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
									isSelected
										? "border-blue-500 bg-blue-50/70 shadow-md ring-2 ring-blue-500/30 dark:border-blue-500 dark:bg-blue-950/40 dark:ring-blue-500/40"
										: "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800/90 dark:bg-[#111927] dark:hover:border-slate-700"
								}`}
							>
								<div>
									{/* Top Badges */}
									<div className="flex items-center justify-between gap-2">
										<span className="inline-flex items-center rounded-lg bg-blue-100/70 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
											{subjectName}
										</span>
										{exam.assignmentType?.name && (
											<span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
												{exam.assignmentType.name}
											</span>
										)}
									</div>

									{/* Title */}
									<h4
										className={`mt-2 line-clamp-1 text-sm font-bold tracking-tight ${
											isSelected
												? "text-blue-950 dark:text-white"
												: "text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
										}`}
									>
										{exam.title}
									</h4>

									{/* Date & Duration Info */}
									<div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
										<span className="inline-flex items-center gap-1">
											<Calendar className="size-3.5" />
											{formatDateOnly(exam.examinationDate)}
										</span>
										{exam.duration ? (
											<span className="inline-flex items-center gap-1">
												<Clock className="size-3.5" />
												{exam.duration} mnt
											</span>
										) : null}
										{exam.maximumScore ? (
											<span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
												Maks: {exam.maximumScore}
											</span>
										) : null}
									</div>
								</div>

								{/* Progress / Status Footer */}
								<div className="mt-3.5 flex w-full items-center justify-between border-t border-slate-200/80 pt-2.5 dark:border-slate-800">
									<div className="flex items-center gap-1.5 text-xs">
										{isComplete ? (
											<CheckCircle2 className="size-3.5 text-emerald-500" />
										) : (
											<div className="size-2 rounded-full bg-blue-500" />
										)}
										<span
											className={`font-semibold ${
												isComplete
													? "text-emerald-700 dark:text-emerald-400"
													: "text-slate-700 dark:text-slate-300"
											}`}
										>
											{progress.total > 0
												? `${progress.graded}/${progress.total} Dinilai`
												: "Siap Dinilai"}
										</span>
									</div>

									{isSelected && (
										<span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
											Aktif Dipilih
										</span>
									)}
								</div>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
