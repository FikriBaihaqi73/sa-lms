import { Check, Shield } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	type AssignmentFormData,
	assignmentFormSchema,
} from "../schemas/assignmentSchema";
import type {
	AssignmentItem,
	AssignmentTypeItem,
	CreateAssignmentPayload,
	LearningModuleOption,
	UpdateAssignmentPayload,
} from "../types";

interface AssignmentDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		payload: CreateAssignmentPayload | UpdateAssignmentPayload,
	) => Promise<void>;
	assignment?: AssignmentItem | null;
	modules: LearningModuleOption[];
	assignmentTypes: AssignmentTypeItem[];
	isSubmitting?: boolean;
}

export const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
	assignment,
	modules,
	assignmentTypes,
	isSubmitting = false,
}) => {
	const isEdit = Boolean(assignment);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AssignmentFormData>({
		defaultValues: {
			title: "",
			module_id: "",
			assignment_type_id: "",
			due_date: "",
			max_score: 100,
			description: "",
		},
	});

	useEffect(() => {
		if (isOpen) {
			if (assignment) {
				const formattedDate = assignment.due_date
					? new Date(assignment.due_date).toISOString().slice(0, 16)
					: "";
				reset({
					title: assignment.title,
					module_id: assignment.module_id,
					assignment_type_id: assignment.assignment_type_id,
					due_date: formattedDate,
					max_score: assignment.max_score ?? 100,
					description: assignment.description || "",
				});
			} else {
				reset({
					title: "",
					module_id: modules[0]?.id || "",
					assignment_type_id: assignmentTypes[0]?.id || "",
					due_date: "",
					max_score: 100,
					description: "",
				});
			}
		}
	}, [isOpen, assignment, modules, assignmentTypes, reset]);

	const onFormSubmit = async (data: AssignmentFormData) => {
		const parsed = assignmentFormSchema.safeParse(data);
		if (!parsed.success) return;

		const payload: CreateAssignmentPayload = {
			title: parsed.data.title,
			module_id: parsed.data.module_id,
			assignment_type_id: parsed.data.assignment_type_id,
			due_date: parsed.data.due_date
				? new Date(parsed.data.due_date).toISOString()
				: null,
			max_score: parsed.data.max_score,
			description: parsed.data.description || null,
		};

		await onSubmit(payload);
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-xl border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111927] dark:text-slate-100">
				<DialogHeader className="border-b border-slate-200 pb-3 text-left dark:border-slate-800/80">
					<div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
						<Shield className="size-4" />
						<span>
							{isEdit
								? "INTERVENSI ADMIN (UBAH PENUGASAN)"
								: "INTERVENSI ADMIN (TAMBAH PENUGASAN)"}
						</span>
					</div>
					<DialogTitle className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
						{isEdit ? "Ubah Penugasan" : "Tambah Penugasan Baru"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						Kelola rincian tugas, batas waktu pengerjaan, dan bobot skor bagi
						siswa di modul pembelajaran.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onFormSubmit)} className="mt-4 space-y-4">
					{/* Judul Tugas */}
					<div>
						<label
							htmlFor="title"
							className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
						>
							Judul Tugas <span className="text-rose-400">*</span>
						</label>
						<input
							id="title"
							type="text"
							{...register("title", { required: "Judul tugas wajib diisi" })}
							placeholder="Contoh: Implementasi Endpoint CRUD Rencana Studi (KRS)"
							className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						/>
						{errors.title && (
							<p className="mt-1 text-[11px] text-rose-400">
								{errors.title.message}
							</p>
						)}
					</div>

					{/* Modul Pembelajaran & Tipe Penugasan */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{/* Modul Pembelajaran */}
						<div>
							<label
								htmlFor="module_id"
								className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								Modul Pembelajaran <span className="text-rose-400">*</span>
							</label>
							<select
								id="module_id"
								{...register("module_id", { required: "Modul wajib dipilih" })}
								className="h-10 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
							>
								<option value="">-- Pilih Modul --</option>
								{modules.map((m) => (
									<option key={m.id} value={m.id}>
										{m.title}
									</option>
								))}
							</select>
							{errors.module_id && (
								<p className="mt-1 text-[11px] text-rose-400">
									{errors.module_id.message}
								</p>
							)}
						</div>

						{/* Tipe Penugasan */}
						<div>
							<label
								htmlFor="assignment_type_id"
								className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								Tipe Penugasan <span className="text-rose-400">*</span>
							</label>
							<select
								id="assignment_type_id"
								{...register("assignment_type_id", {
									required: "Tipe penugasan wajib dipilih",
								})}
								className="h-10 w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
							>
								<option value="">-- Pilih Tipe Tugas --</option>
								{assignmentTypes.map((t) => (
									<option key={t.id} value={t.id}>
										{t.name}
									</option>
								))}
							</select>
							{errors.assignment_type_id && (
								<p className="mt-1 text-[11px] text-rose-400">
									{errors.assignment_type_id.message}
								</p>
							)}
						</div>
					</div>

					{/* Batas Waktu & Skor Maksimal */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{/* Batas Waktu (Due Date) */}
						<div>
							<label
								htmlFor="due_date"
								className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								Batas Waktu (Due Date) <span className="text-rose-400">*</span>
							</label>
							<input
								id="due_date"
								type="datetime-local"
								{...register("due_date", {
									required: "Batas waktu pengumpulan wajib diisi",
								})}
								className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
							/>
							{errors.due_date && (
								<p className="mt-1 text-[11px] text-rose-400">
									{errors.due_date.message}
								</p>
							)}
						</div>

						{/* Skor Maksimal */}
						<div>
							<label
								htmlFor="max_score"
								className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								Skor Maksimal <span className="text-rose-400">*</span>
							</label>
							<input
								id="max_score"
								type="number"
								min="1"
								max="1000"
								{...register("max_score", {
									valueAsNumber: true,
									required: "Skor maksimal wajib diisi",
								})}
								className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
							/>
							{errors.max_score && (
								<p className="mt-1 text-[11px] text-rose-400">
									{errors.max_score.message}
								</p>
							)}
						</div>
					</div>

					{/* Deskripsi / Petunjuk Pengerjaan */}
					<div>
						<label
							htmlFor="description"
							className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
						>
							Instruksi / Petunjuk Pengerjaan
						</label>
						<textarea
							id="description"
							rows={3}
							{...register("description")}
							placeholder="Tuliskan petunjuk penugasan, spesifikasi teknis, atau ketentuan format pengumpulan..."
							className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none resize-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						/>
					</div>

					{/* Modal Footer */}
					<div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-2 dark:border-slate-800/80">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-50"
						>
							<Check className="size-3.5" />
							<span>
								{isSubmitting
									? "Menyimpan..."
									: isEdit
										? "Simpan Perubahan"
										: "Simpan Tugas"}
							</span>
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
