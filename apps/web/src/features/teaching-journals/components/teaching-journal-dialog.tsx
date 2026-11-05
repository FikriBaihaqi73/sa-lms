import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	type TeachingJournalFormValues,
	teachingJournalFormSchema,
} from "../schemas";
import type { ScheduleOption, TeachingJournal } from "../types";

interface TeachingJournalDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: TeachingJournalFormValues) => Promise<void>;
	initialData?: TeachingJournal | null;
	scheduleOptions: ScheduleOption[];
	isSubmitting?: boolean;
}

function toDateInputFormat(dateStr?: string | null): string {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().split("T")[0];
}

export const TeachingJournalDialog: React.FC<TeachingJournalDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	scheduleOptions,
	isSubmitting = false,
}) => {
	const isEditMode = Boolean(initialData);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TeachingJournalFormValues>({
		resolver: zodResolver(teachingJournalFormSchema),
		defaultValues: {
			schedule_id: "",
			meeting_number: null,
			journal_date: new Date().toISOString().split("T")[0],
			topic: "",
			material: "",
			notes: "",
		},
	});

	useEffect(() => {
		if (isOpen) {
			if (initialData) {
				reset({
					schedule_id: initialData.schedule_id,
					meeting_number: initialData.meeting_number ?? null,
					journal_date: toDateInputFormat(initialData.journal_date),
					topic: initialData.topic ?? "",
					material: initialData.material ?? "",
					notes: initialData.notes ?? "",
				});
			} else {
				reset({
					schedule_id: "",
					meeting_number: null,
					journal_date: new Date().toISOString().split("T")[0],
					topic: "",
					material: "",
					notes: "",
				});
			}
		}
	}, [isOpen, initialData, reset]);

	const handleFormSubmit = async (values: TeachingJournalFormValues) => {
		await onSubmit({
			...values,
			meeting_number:
				typeof values.meeting_number === "number" &&
				!Number.isNaN(values.meeting_number)
					? values.meeting_number
					: null,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Ubah Jurnal Mengajar" : "Tambah Jurnal Mengajar"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Perbarui rincian topik, materi pelaksanaan, dan catatan pertemuan kelas."
							: "Catat pelaksanaan kegiatan belajar mengajar pada jadwal pelajaran terkait."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className="space-y-4 py-2"
				>
					{/* Jadwal Pelajaran (Schedule) */}
					<div className="space-y-1.5">
						<label
							htmlFor="journal-schedule-id"
							className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
						>
							Jadwal Pelajaran <span className="text-red-500">*</span>
						</label>
						<select
							id="journal-schedule-id"
							{...register("schedule_id")}
							className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
						>
							<option value="">Pilih Jadwal Pelajaran</option>
							{scheduleOptions.map((sch) => (
								<option key={sch.id} value={sch.id}>
									{sch.day} • {sch.label}{" "}
									{sch.timeRange ? `(${sch.timeRange})` : ""}
								</option>
							))}
						</select>
						{errors.schedule_id && (
							<p className="text-xs text-red-500">
								{errors.schedule_id.message}
							</p>
						)}
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{/* Pertemuan Ke- */}
						<div className="space-y-1.5">
							<label
								htmlFor="journal-meeting-number"
								className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
							>
								Pertemuan Ke-
							</label>
							<Input
								id="journal-meeting-number"
								type="number"
								min={1}
								placeholder="Contoh: 1"
								{...register("meeting_number", { valueAsNumber: true })}
								className="h-10 border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
							/>
							{errors.meeting_number && (
								<p className="text-xs text-red-500">
									{errors.meeting_number.message}
								</p>
							)}
						</div>

						{/* Tanggal Pelaksanaan */}
						<div className="space-y-1.5">
							<label
								htmlFor="journal-date"
								className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
							>
								Tanggal Pembelajaran
							</label>
							<Input
								id="journal-date"
								type="date"
								{...register("journal_date")}
								className="h-10 border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
							/>
							{errors.journal_date && (
								<p className="text-xs text-red-500">
									{errors.journal_date.message}
								</p>
							)}
						</div>
					</div>

					{/* Topik Bahasan */}
					<div className="space-y-1.5">
						<label
							htmlFor="journal-topic"
							className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
						>
							Topik Pembelajaran
						</label>
						<Input
							id="journal-topic"
							type="text"
							placeholder="Contoh: Pengenalan Aljabar Linear"
							{...register("topic")}
							className="h-10 border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
						/>
						{errors.topic && (
							<p className="text-xs text-red-500">{errors.topic.message}</p>
						)}
					</div>

					{/* Rincian Materi */}
					<div className="space-y-1.5">
						<label
							htmlFor="journal-material"
							className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
						>
							Rincian Materi Ajar
						</label>
						<textarea
							id="journal-material"
							rows={4}
							placeholder="Jelaskan pokok bahasan, sub-materi, atau latihan soal yang disampaikan kepada siswa..."
							{...register("material")}
							className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
						/>
						{errors.material && (
							<p className="text-xs text-red-500">{errors.material.message}</p>
						)}
					</div>

					{/* Catatan Tambahan / Evaluasi */}
					<div className="space-y-1.5">
						<label
							htmlFor="journal-notes"
							className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
						>
							Catatan & Evaluasi Kelas
						</label>
						<textarea
							id="journal-notes"
							rows={3}
							placeholder="Catatan kendala, keaktifan siswa, PR/tugas yang diberikan..."
							{...register("notes")}
							className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
						/>
						{errors.notes && (
							<p className="text-xs text-red-500">{errors.notes.message}</p>
						)}
					</div>

					<DialogFooter className="mt-6 flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-blue-600 text-white hover:bg-blue-700"
						>
							{isSubmitting
								? "Menyimpan..."
								: isEditMode
									? "Simpan Perubahan"
									: "Tambah Jurnal"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
