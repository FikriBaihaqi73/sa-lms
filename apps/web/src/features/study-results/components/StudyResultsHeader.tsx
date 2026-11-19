import { Download, GraduationCap, Plus } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface StudyResultsHeaderProps {
	onAddResult: () => void;
	onExport: () => void;
	isExporting?: boolean;
}

export const StudyResultsHeader: React.FC<StudyResultsHeaderProps> = ({
	onAddResult,
	onExport,
	isExporting = false,
}) => {
	return (
		<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3">
				<div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
					<GraduationCap className="size-6" />
				</div>
				<div>
					<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
						Rekap Nilai Siswa
					</h1>
					<p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
						Pantau hasil studi, capaian SKS, dan indeks prestasi siswa secara
						terintegrasi per semester.
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2.5">
				<Button
					type="button"
					variant="outline"
					onClick={onExport}
					disabled={isExporting}
					className="h-9 gap-2 rounded-xl border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
					title="Ekspor Data Rekap Nilai ke Format CSV"
					aria-label="Ekspor Data Rekap Nilai"
				>
					<Download className="size-4" />
					<span>{isExporting ? "Mengekspor..." : "Ekspor CSV"}</span>
				</Button>

				<Button
					type="button"
					onClick={onAddResult}
					className="h-9 gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
				>
					<Plus className="size-4" />
					<span>Tambah Rekap Nilai</span>
				</Button>
			</div>
		</header>
	);
};
