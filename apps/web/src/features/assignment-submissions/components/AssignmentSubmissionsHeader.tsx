import { CalendarDays, Download } from "lucide-react";
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
		<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400">
						<CalendarDays className="size-3.5" aria-hidden="true" /> TUGAS &amp;
						SUBMISI
					</span>
				</div>
				<h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
					Pengumpulan Tugas Siswa
				</h1>
				<p className="mt-1 max-w-2xl text-sm text-slate-300">
					Kelola dan pantau pengumpulan tugas siswa, status, serta hasil
					penilaian.
				</p>
			</div>

			{canExport && onExport ? (
				<div className="flex items-center gap-2">
					<Button
						type="button"
						onClick={onExport}
						className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
					>
						<Download className="size-4" /> Unduh Laporan
					</Button>
				</div>
			) : null}
		</header>
	);
};
