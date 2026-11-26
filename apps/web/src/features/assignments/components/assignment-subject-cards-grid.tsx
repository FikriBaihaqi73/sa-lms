import { ArrowRight, BookOpen, FileText, Layers, Users } from "lucide-react";
import type React from "react";
import type { AssignmentItem } from "../types";

export interface SubjectAssignmentSummary {
	subjectKey: string;
	subjectName: string;
	subjectCode?: string | null;
	teacherName: string;
	classNames: string[];
	assignments: AssignmentItem[];
	totalSubmitted: number;
	totalExpected: number;
}

export function groupAssignmentsBySubject(
	assignments: AssignmentItem[],
	submissionsCountMap: Record<
		string,
		{ submitted: number; total: number; pendingGrading: number }
	> = {},
	fallbackClassName = "Kelas Terpilih",
): SubjectAssignmentSummary[] {
	const map = new Map<
		string,
		SubjectAssignmentSummary & { classSet: Set<string> }
	>();

	for (const asg of assignments) {
		const subj = asg.module?.class_subject?.subject;
		const subjectKey = subj?.id || `subject-${asg.module?.id || asg.id}`;
		const subjectName = subj?.name || asg.module?.title || "Mata Pelajaran";
		const subjectCode = subj?.code ?? null;
		const teacherName =
			asg.module?.class_subject?.teacher?.profile?.fullName || "Guru Pengampu";
		const clsName = asg.module?.class_subject?.class?.name || fallbackClassName;
		const counts = submissionsCountMap[asg.id] ?? {
			submitted: 0,
			total: 0,
			pendingGrading: 0,
		};

		let group = map.get(subjectKey);
		if (!group) {
			group = {
				subjectKey,
				subjectName,
				subjectCode,
				teacherName,
				classNames: [],
				assignments: [],
				totalSubmitted: 0,
				totalExpected: 0,
				classSet: new Set<string>(),
			};
			map.set(subjectKey, group);
		}

		group.assignments.push(asg);
		if (clsName) group.classSet.add(clsName);
		group.totalSubmitted += counts.submitted;
		group.totalExpected += counts.total;
	}

	return Array.from(map.values()).map((g) => ({
		subjectKey: g.subjectKey,
		subjectName: g.subjectName,
		subjectCode: g.subjectCode,
		teacherName: g.teacherName,
		classNames: Array.from(g.classSet),
		assignments: g.assignments,
		totalSubmitted: g.totalSubmitted,
		totalExpected: g.totalExpected,
	}));
}

interface AssignmentSubjectCardsGridProps {
	subjects: SubjectAssignmentSummary[];
	onSelectSubject: (subjectKey: string) => void;
	classNameText?: string;
	isLoading?: boolean;
}

export const AssignmentSubjectCardsGrid: React.FC<
	AssignmentSubjectCardsGridProps
> = ({
	subjects,
	onSelectSubject,
	classNameText = "Kelas Terpilih",
	isLoading = false,
}) => {
	return (
		<div className="space-y-3">
			{/* Section Header */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800/80">
				<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
					<Layers className="size-4 text-blue-600 dark:text-blue-400" />
					<span>
						DAFTAR MATA PELAJARAN YANG MEMILIKI TUGAS DI {classNameText}
					</span>
				</div>
				<span className="text-[11px] text-slate-500 dark:text-slate-400">
					Pilih mata pelajaran untuk melihat data santri & pengumpulan tugas
				</span>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
					{["sub-sk-1", "sub-sk-2", "sub-sk-3"].map((k) => (
						<div
							key={k}
							className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111927]/60"
						/>
					))}
				</div>
			) : subjects.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#111927]/50">
					<BookOpen className="size-10 text-slate-400 dark:text-slate-600" />
					<h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
						Belum ada mata pelajaran yang memiliki tugas
					</h3>
					<p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
						Belum ada penugasan untuk kelas dan filter yang dipilih. Klik tombol
						Tambah Tugas untuk membuat penugasan baru.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
					{subjects.map((subj) => (
						<button
							key={subj.subjectKey}
							type="button"
							onClick={() => onSelectSubject(subj.subjectKey)}
							className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-500/60 hover:shadow-md dark:border-slate-800 dark:bg-[#111927] dark:hover:border-blue-500/60 dark:hover:bg-[#142038]"
						>
							<div className="space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400">
										<BookOpen className="size-5" />
									</div>
									<div className="flex flex-wrap items-center justify-end gap-1.5">
										{subj.subjectCode && (
											<span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
												{subj.subjectCode}
											</span>
										)}
										<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
											{subj.assignments.length} Tugas
										</span>
									</div>
								</div>

								<div>
									<h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
										{subj.subjectName}
									</h3>
									<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
										Pengampu: {subj.teacherName}
									</p>
								</div>

								<div className="space-y-1">
									<p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
										<FileText className="size-3" /> Judul Tugas
									</p>
									<p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
										{subj.assignments.map((a) => a.title).join(" • ")}
									</p>
								</div>
							</div>

							<div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
								<span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
									<Users className="size-3.5" />
									{subj.totalSubmitted}/{subj.totalExpected} Submisi
								</span>
								<span className="inline-flex items-center gap-1 font-semibold text-blue-600 transition-transform group-hover:translate-x-0.5 dark:text-blue-400">
									Lihat Data Santri
									<ArrowRight className="size-3.5" />
								</span>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
