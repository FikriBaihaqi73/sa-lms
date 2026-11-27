import { BookOpen, Plus } from "lucide-react";
import type React from "react";

interface StudyPlanHeaderProps {
	activeAcademicYearName?: string;
	onAddClick: () => void;
	onExportClick?: () => void;
	isExportDisabled?: boolean;
}

export const StudyPlanHeader: React.FC<StudyPlanHeaderProps> = ({
	activeAcademicYearName,
	onAddClick,
}) => {
	return (
		<header className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between w-full">
			<div className="flex items-start gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400">
					<BookOpen className="size-4.5" />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
							DATA AKADEMIK • SELF-ENROLLMENT & MONITORING
						</span>
						{activeAcademicYearName && (
							<span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
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

			<div className="flex items-center justify-end sm:shrink-0 sm:ml-auto">
				<button
					type="button"
					onClick={onAddClick}
					className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-500"
				>
					<Plus className="size-3.5" />
					<span>Tambah / Force Enroll KRS</span>
				</button>
			</div>
		</header>
	);
};
