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
import { Label } from "@/components/ui/label";
import { moduleFormSchema, type ModuleFormValues } from "../schemas";
import type { ClassSubjectOption, LearningModule } from "../types";

interface ModuleDialogProps {
	isOpen: boolean;
	module: LearningModule | null;
	classSubjectOptions: ClassSubjectOption[];
	isSubmitting: boolean;
	onClose: () => void;
	onSubmit: (data: ModuleFormValues) => Promise<void>;
}

export const ModuleDialog: React.FC<ModuleDialogProps> = ({
	isOpen,
	module,
	classSubjectOptions,
	isSubmitting,
	onClose,
	onSubmit,
}) => {
	const isEdit = Boolean(module);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<ModuleFormValues>({
		resolver: zodResolver(moduleFormSchema),
		defaultValues: {
			class_subject_id: "",
			title: "",
			description: "",
			display_order: 1,
			is_published: false,
			is_locked: false,
		},
	});

	const isPublished = watch("is_published");
	const isLocked = watch("is_locked");

	useEffect(() => {
		if (isOpen) {
			if (module) {
				reset({
					class_subject_id: module.class_subject_id,
					title: module.title,
					description: module.description || "",
					display_order: module.display_order ?? 1,
					is_published: Boolean(module.is_published),
					is_locked: Boolean(module.is_locked),
				});
			} else {
				reset({
					class_subject_id: classSubjectOptions[0]?.id || "",
					title: "",
					description: "",
					display_order: 1,
					is_published: false,
					is_locked: false,
				});
			}
		}
	}, [isOpen, module, classSubjectOptions, reset]);

	const onFormSubmit = async (data: ModuleFormValues) => {
		await onSubmit(data);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
						{isEdit ? "Ubah Modul Pembelajaran" : "Tambah Modul Pembelajaran"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						{isEdit
							? "Perbarui informasi silabus, urutan tampil, atau status akses modul."
							: "Isi data silabus atau bab materi untuk mata pelajaran kelas institusi."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
					{/* Mapel Kelas */}
					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Mata Pelajaran Kelas <span className="text-red-500">*</span>
						</Label>
						<select
							{...register("class_subject_id")}
							className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
						>
							<option value="">Pilih Mapel Kelas</option>
							{classSubjectOptions.map((opt) => (
								<option key={opt.id} value={opt.id}>
									{opt.label}
								</option>
							))}
						</select>
						{errors.class_subject_id && (
							<p className="text-xs text-red-500">
								{errors.class_subject_id.message}
							</p>
						)}
					</div>

					{/* Judul Modul */}
					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Judul Modul <span className="text-red-500">*</span>
						</Label>
						<Input
							type="text"
							{...register("title")}
							placeholder="Contoh: Bab 1 - Pengenalan Algoritma & Pemrograman"
							className="h-10 border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-950"
						/>
						{errors.title && (
							<p className="text-xs text-red-500">{errors.title.message}</p>
						)}
					</div>

					{/* Deskripsi Modul */}
					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Deskripsi / Rangkuman Silabus
						</Label>
						<textarea
							rows={3}
							{...register("description")}
							placeholder="Jelaskan pokok bahasan, kompetensi dasar, atau petunjuk belajar modul ini..."
							className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
						/>
						{errors.description && (
							<p className="text-xs text-red-500">
								{errors.description.message}
							</p>
						)}
					</div>

					{/* Urutan Tampil (Display Order) */}
					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Urutan Tampil (Display Order)
						</Label>
						<Input
							type="number"
							min={1}
							{...register("display_order", { valueAsNumber: true })}
							placeholder="1"
							className="h-10 border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-950"
						/>
						{errors.display_order && (
							<p className="text-xs text-red-500">
								{errors.display_order.message}
							</p>
						)}
					</div>

					{/* Toggle Terbitkan & Terkunci */}
					<div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
						<label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-800/40">
							<input
								type="checkbox"
								checked={isPublished}
								onChange={(e) => setValue("is_published", e.target.checked)}
								className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
							/>
							<div className="text-xs">
								<p className="font-semibold text-slate-800 dark:text-slate-200">
									Terbitkan Modul
								</p>
								<p className="text-slate-400">Dapat dilihat oleh siswa</p>
							</div>
						</label>

						<label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-800/40">
							<input
								type="checkbox"
								checked={isLocked}
								onChange={(e) => setValue("is_locked", e.target.checked)}
								className="size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
							/>
							<div className="text-xs">
								<p className="font-semibold text-slate-800 dark:text-slate-200">
									Kunci Modul
								</p>
								<p className="text-slate-400">Akses materi dibatasi</p>
							</div>
						</label>
					</div>

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
							className="border-slate-200 dark:border-slate-800"
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-sm hover:from-blue-800 hover:to-indigo-700"
						>
							{isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Modul"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

