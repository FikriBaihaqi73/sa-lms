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
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/20 text-blue-400 shadow-sm">
					<BookOpen className="size-5" />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
							DATA AKADEMIK • SELF-ENROLLMENT & MONITORING
						</span>
						{activeAcademicYearName && (
							<span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
								{activeAcademicYearName}
							</span>
						)}
					</div>
					<h1 className="mt-0.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
						Rencana Studi (KRS)
					</h1>
					<p className="mt-0.5 text-xs text-slate-400">
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
					className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#131c2e] px-3.5 py-2 text-xs font-medium text-slate-200 shadow-sm transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
