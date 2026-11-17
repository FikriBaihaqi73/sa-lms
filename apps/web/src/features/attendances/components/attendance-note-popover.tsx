import { Check, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AttendanceStatusIcon } from "@/features/attendance-statuses/components/attendance-status-icon";
import type { AttendanceStatusOption } from "../types";

interface AttendanceNoteDialogProps {
	isOpen: boolean;
	onClose: () => void;
	studentName: string;
	studentNumber?: string;
	dateFormatted: string;
	currentStatusId?: string | null;
	currentNotes?: string | null;
	statusOptions: AttendanceStatusOption[];
	isSubmitting?: boolean;
	onSave: (statusId: string, notes?: string | null) => Promise<void>;
	onDelete?: () => Promise<void>;
}

export const AttendanceNoteDialog: React.FC<AttendanceNoteDialogProps> = ({
	isOpen,
	onClose,
	studentName,
	studentNumber,
	dateFormatted,
	currentStatusId,
	currentNotes,
	statusOptions,
	isSubmitting = false,
	onSave,
	onDelete,
}) => {
	const [selectedStatusId, setSelectedStatusId] = useState<string>("");
	const [notes, setNotes] = useState<string>("");

	useEffect(() => {
		if (isOpen) {
			setSelectedStatusId(currentStatusId ?? statusOptions[0]?.id ?? "");
			setNotes(currentNotes ?? "");
		}
	}, [isOpen, currentStatusId, currentNotes, statusOptions]);

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStatusId) return;
		await onSave(selectedStatusId, notes.trim() || null);
		onClose();
	};

	const handleDelete = async () => {
		if (!onDelete) return;
		await onDelete();
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-md border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111927] dark:text-slate-100">
				{/* 1. Header Card */}
				<DialogHeader className="border-b border-slate-200 pb-3 text-left dark:border-slate-800/80">
					<DialogTitle className="text-base font-semibold text-slate-900 dark:text-white">
						Status Kehadiran Siswa
					</DialogTitle>
					<DialogDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
						{studentName} {studentNumber ? `(${studentNumber})` : ""} •{" "}
						{dateFormatted}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleFormSubmit} className="mt-3 space-y-4">
					{/* 2. Pilihan Status Kehadiran Dinamis */}
					<div>
						<span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
							PILIH STATUS KEHADIRAN
						</span>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{statusOptions.map((st) => {
								const isSelected = selectedStatusId === st.id;
								const statusColor = st.color || "#2563EB";

								let style: React.CSSProperties | undefined;
								const tone =
									"border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-[#0c1322] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60";

								if (isSelected) {
									style = {
										borderColor: statusColor,
										backgroundColor: `${statusColor}25`,
										color: statusColor,
										boxShadow: `0 0 0 1px ${statusColor}`,
									};
								}

								return (
									<button
										key={st.id}
										type="button"
										onClick={() => setSelectedStatusId(st.id)}
										style={style}
										className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-semibold transition-all ${tone}`}
									>
										<span
											className="size-2 rounded-full shrink-0"
											style={{ backgroundColor: statusColor }}
										/>
										<AttendanceStatusIcon
											icon={st.icon}
											className="size-3.5 shrink-0"
										/>
										<span className="truncate">{st.name}</span>
										{isSelected && <Check className="size-3 ml-0.5 shrink-0" />}
									</button>
								);
							})}
						</div>
					</div>

					{/* 3. Input Catatan (notes) */}
					<div>
						<label
							htmlFor="attendance-notes"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
						>
							CATATAN / KETERANGAN (OPSIONAL)
						</label>
						<textarea
							id="attendance-notes"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Tuliskan catatan evaluasi, kendala, atau keterangan khusus siswa..."
							className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
						/>
					</div>

					{/* 4. Footer Aksi */}
					<div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800/80">
						{currentStatusId && onDelete ? (
							<button
								type="button"
								onClick={handleDelete}
								disabled={isSubmitting}
								className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
							>
								<Trash2 className="size-3.5" />
								<span>Hapus / Reset</span>
							</button>
						) : (
							<div />
						)}

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={onClose}
								disabled={isSubmitting}
								className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
							>
								Batal
							</button>

							<button
								type="submit"
								disabled={isSubmitting || !selectedStatusId}
								className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
							>
								{isSubmitting ? "Menyimpan..." : "Simpan"}
							</button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
