import { Clock, Layers, Pencil, Trash2 } from "lucide-react";
import type React from "react";
import type { AssignmentItem } from "../types";

interface AssignmentCardsGridProps {
	assignments: AssignmentItem[];
	selectedAssignmentId?: string;
	onSelectAssignment: (assignment: AssignmentItem) => void;
	onEditAssignment: (assignment: AssignmentItem) => void;
	onDeleteAssignment: (assignment: AssignmentItem) => void;
	classNameText?: string;
	isLoading?: boolean;
	submissionsCountMap?: Record<
		string,
		{ submitted: number; total: number; pendingGrading: number }
	>;
}

export const AssignmentCardsGrid: React.FC<AssignmentCardsGridProps> = ({
	assignments,
	selectedAssignmentId,
	onSelectAssignment,
	onEditAssignment,
	onDeleteAssignment,
	classNameText = "Kelas Terpilih",
	isLoading = false,
	submissionsCountMap = {},
}) => {
	return (
		<div className="space-y-3">
			{/* Section Header */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800/80">
				<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
					<Layers className="size-4 text-blue-600 dark:text-blue-400" />
					<span>
						DAFTAR TUGAS DI {classNameText} (KLIK TUGAS UNTUK MELIHAT SUBMISI
						SISWA)
					</span>
				</div>
				<span className="text-[11px] text-slate-500 dark:text-slate-400">
					Tugas dibuat oleh Guru Pengampu • Admin dapat mengelola penugasan
				</span>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111927]/60"
						/>
					))}
				</div>
			) : assignments.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#111927]/50">
					<Layers className="size-10 text-slate-400 dark:text-slate-600" />
					<h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
						Belum ada tugas yang diterbitkan
					</h3>
					<p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
						Belum ada penugasan untuk modul dan kelas yang dipilih. Klik tombol
						Tambah Tugas untuk membuat penugasan baru.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
					{assignments.map((asg) => {
						const isSelected = asg.id === selectedAssignmentId;
						const countData = submissionsCountMap[asg.id] || {
							submitted: 0,
							total: 5,
							pendingGrading: 0,
						};

						const subjectName =
							asg.module?.class_subject?.subject?.name || "Mata Pelajaran";
						const subjectCode = asg.module?.class_subject?.subject?.code;
						const teacherName =
							asg.module?.class_subject?.teacher?.profile?.fullName ||
							"Guru Pengampu";
						const typeName = asg.assignment_type?.name || "Tugas";

						const formattedDueDate = asg.due_date
							? new Date(asg.due_date).toLocaleDateString("id-ID", {
									year: "numeric",
									month: "2-digit",
									day: "2-digit",
									hour: "2-digit",
									minute: "2-digit",
								})
							: "-";

						return (
							<div
								key={asg.id}
								className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
									isSelected
										? "border-blue-500 bg-blue-50/80 shadow-md dark:border-blue-500 dark:bg-blue-950/20 dark:shadow-lg dark:shadow-blue-500/10"
										: "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800/90 dark:bg-[#0d1526]/80 dark:hover:border-slate-700 dark:hover:bg-[#111927]"
								}`}
							>
								{/* Card Selection Button */}
								<button
									type="button"
									onClick={() => onSelectAssignment(asg)}
									aria-label={`Pilih tugas ${asg.title}`}
									className="absolute inset-0 z-0 rounded-2xl cursor-pointer"
								/>

								{/* Card Top: Badges & Action Buttons (Pencil on left of Trash2) */}
								<div className="relative z-10 pointer-events-none">
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-1.5 flex-wrap">
											<span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-950/60 dark:text-blue-400">
												{typeName}
											</span>
											{subjectCode && (
												<span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
													{subjectCode}
												</span>
											)}
										</div>

										{/* Pencil (Edit) on the left of Trash2 (Delete) */}
										<div className="flex items-center gap-1 shrink-0 pointer-events-auto">
											<button
												type="button"
												title="Ubah Penugasan"
												aria-label={`Ubah penugasan ${asg.title}`}
												onClick={() => onEditAssignment(asg)}
												className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 cursor-pointer"
											>
												<Pencil className="size-3.5" />
											</button>
											<button
												type="button"
												title="Hapus Penugasan"
												aria-label={`Hapus penugasan ${asg.title}`}
												onClick={() => onDeleteAssignment(asg)}
												className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 cursor-pointer"
											>
												<Trash2 className="size-3.5" />
											</button>
										</div>
									</div>

									{/* Card Title & Teacher */}
									<h4 className="mt-2.5 font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300 transition-colors">
										{asg.title}
									</h4>
									<p className="mt-0.5 text-xs text-slate-500 line-clamp-1 dark:text-slate-400">
										{subjectName} • Pengampu: {teacherName}
									</p>
								</div>

								{/* Middle: Progres Terkumpul & Grading Status */}
								<div className="relative z-10 pointer-events-none mt-4 space-y-1.5">
									<div className="flex items-center justify-between text-xs">
										<span className="text-slate-600 dark:text-slate-300">
											Terkumpul:{" "}
											<strong className="text-slate-900 dark:text-white">
												{countData.submitted}/{countData.total} Siswa
											</strong>
										</span>
										{countData.submitted === 0 ? (
											<span className="text-[10px] text-slate-400 dark:text-slate-500">
												0 Submisi
											</span>
										) : countData.pendingGrading > 0 ? (
											<span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300">
												{countData.pendingGrading} Belum Dinilai Guru
											</span>
										) : (
											<span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400">
												Semua Dinilai
											</span>
										)}
									</div>

									{/* Visual Progress Bar */}
									<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
										<div
											className={`h-full transition-all duration-300 ${
												isSelected ? "bg-blue-500" : "bg-blue-600/70"
											}`}
											style={{
												width: `${Math.min(
													100,
													countData.total > 0
														? (countData.submitted / countData.total) * 100
														: 0,
												)}%`,
											}}
										/>
									</div>
								</div>

								{/* Bottom Meta: Tenggat & Maks Poin */}
								<div className="relative z-10 pointer-events-none mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
									<div className="flex items-center gap-1.5">
										<Clock className="size-3 text-slate-400 dark:text-slate-500" />
										<span>Tenggat: {formattedDueDate}</span>
									</div>
									<span className="font-semibold text-slate-700 dark:text-slate-300">
										Maks: {asg.max_score ?? 100} Poin
									</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
