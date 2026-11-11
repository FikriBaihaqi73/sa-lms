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
			<DialogContent className="max-w-md border-slate-800 bg-[#111927] p-6 text-slate-100 shadow-2xl">
				{/* 1. Header Card */}
				<DialogHeader className="border-b border-slate-800/80 pb-3 text-left">
					<DialogTitle className="text-base font-semibold text-white">
						Status Kehadiran Siswa
					</DialogTitle>
					<DialogDescription className="mt-1 text-xs text-slate-400">
						{studentName} {studentNumber ? `(${studentNumber})` : ""} •{" "}
						{dateFormatted}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleFormSubmit} className="mt-3 space-y-4">
					{/* 2. Pilihan Status Kehadiran Dinamis */}
					<div>
						<span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
							PILIH STATUS KEHADIRAN
						</span>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{statusOptions.map((st) => {
								const isSelected = selectedStatusId === st.id;

								let tone =
									"border-slate-800 bg-[#0c1322] text-slate-300 hover:border-slate-700 hover:bg-slate-800/60";
								let dotColor = "bg-slate-500";

								if (st.typeCategory === "hadir") {
									dotColor = "bg-emerald-400";
									if (isSelected) {
										tone =
											"border-emerald-500/80 bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-500";
									}
								} else if (st.typeCategory === "izin") {
									dotColor = "bg-blue-400";
									if (isSelected) {
										tone =
											"border-blue-500/80 bg-blue-950/80 text-blue-300 ring-1 ring-blue-500";
									}
								} else if (st.typeCategory === "sakit") {
									dotColor = "bg-amber-400";
									if (isSelected) {
										tone =
											"border-amber-500/80 bg-amber-950/80 text-amber-300 ring-1 ring-amber-500";
									}
								} else if (st.typeCategory === "alpa") {
									dotColor = "bg-rose-400";
									if (isSelected) {
										tone =
											"border-rose-500/80 bg-rose-950/80 text-rose-300 ring-1 ring-rose-500";
									}
								} else if (isSelected) {
									tone =
										"border-purple-500/80 bg-purple-950/80 text-purple-300 ring-1 ring-purple-500";
									dotColor = "bg-purple-400";
								}

								return (
									<button
										key={st.id}
										type="button"
										onClick={() => setSelectedStatusId(st.id)}
										className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-semibold transition-all ${tone}`}
									>
										<span className={`size-1.5 rounded-full ${dotColor}`} />
										<span>{st.name}</span>
										{isSelected && <Check className="size-3 ml-0.5" />}
									</button>
								);
							})}
						</div>
					</div>

					{/* 3. Input Catatan (notes) */}
					<div>
						<label
							htmlFor="attendance-notes"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
						>
							CATATAN / KETERANGAN (OPSIONAL)
						</label>
						<textarea
							id="attendance-notes"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Tuliskan catatan evaluasi, kendala, atau keterangan khusus siswa..."
							className="w-full rounded-lg border border-slate-700/60 bg-[#0c1322] p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
						/>
					</div>

					{/* 4. Footer Aksi */}
					<div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
						{currentStatusId && onDelete ? (
							<button
								type="button"
								onClick={handleDelete}
								disabled={isSubmitting}
								className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-900/40 hover:text-rose-300 disabled:opacity-50"
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
								className="rounded-lg border border-slate-700/60 bg-transparent px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
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
