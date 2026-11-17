import { Download, Eye, FileArchive } from "lucide-react";
import type React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { StudentSubmissionRow } from "../types";

interface SubmissionDetailDialogProps {
	isOpen: boolean;
	onClose: () => void;
	submission?: StudentSubmissionRow | null;
	assignmentTitle?: string;
}

export const SubmissionDetailDialog: React.FC<SubmissionDetailDialogProps> = ({
	isOpen,
	onClose,
	submission,
	assignmentTitle = "Penugasan",
}) => {
	if (!submission) return null;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-lg border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111927] dark:text-slate-100">
				<DialogHeader className="border-b border-slate-200 pb-3 text-left dark:border-slate-800/80">
					<div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
						<Eye className="size-4" />
						<span>AUDIT SUBMISI SISWA</span>
					</div>
					<DialogTitle className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
						{submission.fullName}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						NIS: {submission.studentNumber} • {submission.email} •{" "}
						{submission.className}
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4 text-xs">
					{/* Tugas Terkait */}
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0c1322]">
						<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
							TUGAS YANG DIKERJAKAN
						</span>
						<p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
							{assignmentTitle}
						</p>
					</div>

					{/* Rincian Status Pengumpulan & Waktu */}
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0c1322]">
							<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
								STATUS PENGUMPULAN
							</span>
							<p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
								{submission.statusPengumpulan === "sudah_kumpul"
									? "Sudah Mengumpulkan"
									: submission.statusPengumpulan === "terlambat"
										? "Terlambat Mengumpulkan"
										: "Belum Mengumpulkan"}
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0c1322]">
							<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
								WAKTU SUBMISI
							</span>
							<p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
								{submission.waktuKirim || "—"}
							</p>
						</div>
					</div>

					{/* Berkas Lampiran Siswa */}
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0c1322]">
						<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
							BERKAS YANG DIKIRIM
						</span>
						{submission.namaBerkas ? (
							<div className="mt-1.5 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700/60 dark:bg-slate-900/60">
								<div className="flex items-center gap-2 truncate">
									<FileArchive className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
									<span className="truncate font-medium text-slate-700 dark:text-slate-200">
										{submission.namaBerkas}
									</span>
								</div>
								<button
									type="button"
									onClick={() => {
										// Simulated file download
										alert(`Mengunduh berkas ${submission.namaBerkas}`);
									}}
									className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
								>
									<Download className="size-3" />
									<span>Unduh</span>
								</button>
							</div>
						) : (
							<p className="mt-1 text-slate-400 dark:text-slate-500">
								Belum ada berkas yang dikirimkan.
							</p>
						)}
					</div>

					{/* Penilaian & Catatan Guru */}
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 dark:border-slate-800 dark:bg-[#0c1322]">
						<div className="flex items-center justify-between">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
								HASIL PENILAIAN GURU PENGAMPU
							</span>
							<span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-400">
								{submission.nilaiAkhir !== undefined &&
								submission.nilaiAkhir !== null
									? `${submission.nilaiAkhir} / ${submission.skorMaksimal} Poin`
									: "Belum Dinilai"}
							</span>
						</div>
						<div>
							<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
								CATATAN & FEEDBACK
							</span>
							<p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed italic">
								{submission.catatanFeedback ||
									"Belum ada catatan atau umpan balik evaluasi dari guru pengampu."}
							</p>
						</div>
					</div>
				</div>

				<div className="mt-4 flex justify-end border-t border-slate-200 pt-3 dark:border-slate-800/80">
					<button
						type="button"
						onClick={onClose}
						className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
					>
						Tutup
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
