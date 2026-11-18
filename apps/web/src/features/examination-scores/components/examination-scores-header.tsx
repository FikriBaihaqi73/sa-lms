import { Download, Plus } from "lucide-react";
import type React from "react";

interface ExaminationScoresHeaderProps {
	onExport: () => void;
	onOpenInputDialog: () => void;
	isExportDisabled?: boolean;
}

export const ExaminationScoresHeader: React.FC<
	ExaminationScoresHeaderProps
> = ({ onExport, onOpenInputDialog, isExportDisabled = false }) => {
	return (
		<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50/80 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-950/60 dark:text-blue-400">
					<span>EVALUASI & HASIL AKADEMIK</span>
				</div>
				<h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
					Nilai Ujian (Examination Scores)
				</h1>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
					Pusat pemantauan hasil evaluasi ujian siswa per kelas, audit penilai,
					dan pengelolaan skor terintegrasi standar penilaian.
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-2.5">
				<button
					type="button"
					onClick={onExport}
					disabled={isExportDisabled}
					className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
				>
					<Download className="size-4 text-slate-500 dark:text-slate-400" />
					<span>Ekspor Rekap Nilai</span>
				</button>

				<button
					type="button"
					onClick={onOpenInputDialog}
					className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
				>
					<Plus className="size-4" />
					<span>Input / Koreksi Nilai</span>
				</button>
			</div>
		</header>
	);
};
