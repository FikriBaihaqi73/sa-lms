import { BookOpen, Download, Plus } from "lucide-react";
import type React from "react";

interface StudyPlanHeaderProps {
	activeAcademicYearName?: string;
	onAddClick: () => void;
	onExportClick: () => void;
	isExportDisabled?: boolean;
}

export const StudyPlanHeader: React.FC<StudyPlanHeaderProps> = ({
	activeAcademicYearName,
	onAddClick,
	onExportClick,
	isExportDisabled = false,
}) => {
	return (
		<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3.5">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/30 dark:bg-blue-600/20 dark:text-blue-400">
					<BookOpen className="size-5" />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
							DATA AKADEMIK • SELF-ENROLLMENT & MONITORING
						</span>
						{activeAcademicYearName && (
							<span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400">
								{activeAcademicYearName}
							</span>
						)}
					</div>
					<h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
						Rencana Studi (KRS)
					</h1>
					<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
						Pusat kontrol pengambilan mata pelajaran kelas, pemantauan beban
						kredit (SKS) siswa, dan katalog kelas aktif.
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2.5">
				<button
					type="button"
					onClick={onExportClick}
					disabled={isExportDisabled}
					className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/80 dark:bg-[#131c2e] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
				>
					<Download className="size-3.5" />
					<span>Ekspor KRS</span>
				</button>

				<button
					type="button"
					onClick={onAddClick}
					className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
				>
					<Plus className="size-3.5" />
					<span>Tambah / Force Enroll KRS</span>
				</button>
			</div>
		</header>
	);
};
