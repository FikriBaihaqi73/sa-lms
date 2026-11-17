import { BookOpen, Download, Plus } from "lucide-react";
import type React from "react";

interface AssignmentHeaderProps {
	activeAcademicYearLabel?: string;
	onExportClick?: () => void;
	onAddAssignmentClick?: () => void;
	isExportDisabled?: boolean;
}

export const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
	activeAcademicYearLabel = "2026/2028 (Aktif)",
	onExportClick,
	onAddAssignmentClick,
	isExportDisabled = false,
}) => {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400">
					<BookOpen className="size-6" />
				</div>
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
							DATA AKADEMIK • MONITORING & AUDIT PENUGASAN
						</span>
						{activeAcademicYearLabel && (
							<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-400">
								{activeAcademicYearLabel}
							</span>
						)}
					</div>
					<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
						Monitoring Tugas & Submisi (Assignments)
					</h1>
					<p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">
						Pantau keaktifan pemberian tugas oleh guru, progres pengumpulan
						siswa, serta audit penilaian per kelas secara terpusat.
					</p>
				</div>
			</div>

			{/* Action Buttons: Impor/Ekspor Rekap Siswa & Tambah Tugas */}
			<div className="flex items-center gap-2.5 shrink-0">
				<button
					type="button"
					onClick={onExportClick}
					disabled={isExportDisabled}
					className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700"
				>
					<Download className="size-3.5" />
					<span>Ekspor Rekap Kelas</span>
				</button>

				<button
					type="button"
					onClick={onAddAssignmentClick}
					className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-95"
				>
					<Plus className="size-3.5" />
					<span>Tambah Tugas</span>
				</button>
			</div>
		</div>
	);
};
