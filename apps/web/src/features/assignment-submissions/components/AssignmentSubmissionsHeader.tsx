import { Download, FileCheck2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface AssignmentSubmissionsHeaderProps {
	onExport?: () => void;
	canExport?: boolean;
}

export const AssignmentSubmissionsHeader: React.FC<
	AssignmentSubmissionsHeaderProps
> = ({ onExport, canExport = false }) => {
	return (
		<header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
			<div className="flex items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400">
					<FileCheck2 className="size-5" aria-hidden="true" />
				</div>
				<div className="space-y-0.5">
					<span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
						PENGUMPULAN TUGAS
					</span>
					<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
						Hasil Pengumpulan Tugas Siswa
					</h1>
					<p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">
						Lihat dan tinjau hasil tugas (berkas &amp; jawaban) yang sudah
						dikirimkan oleh siswa ke sistem.
					</p>
				</div>
			</div>

			{canExport && onExport ? (
				<div className="flex shrink-0 items-center gap-2">
					<Button
						type="button"
						onClick={onExport}
						className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
					>
						<Download className="size-3.5" /> Unduh Laporan
					</Button>
				</div>
			) : null}
		</header>
	);
};
