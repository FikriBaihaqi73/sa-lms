import { zodResolver } from "@hookform/resolvers/zod";
import { Sliders, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type SettingFormValues,
	settingFormSchema,
} from "../schemas/settingSchema";
import type { Setting } from "../types";

interface SettingDialogProps {
	open: boolean;
	setting?: Setting | null;
	isSaving: boolean;
	onClose: () => void;
	onSave: (values: SettingFormValues) => Promise<void>;
}

export function SettingDialog({
	open,
	setting,
	isSaving,
	onClose,
	onSave,
}: SettingDialogProps) {
	const isEditing = Boolean(setting);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SettingFormValues>({
		resolver: zodResolver(settingFormSchema),
		defaultValues: {
			settingKey: "",
			settingValue: "",
			description: "",
		},
	});

	useEffect(() => {
		if (setting) {
			reset({
				settingKey: setting.settingKey,
				settingValue: setting.settingValue || "",
				description: setting.description || "",
			});
		} else {
			reset({
				settingKey: "",
				settingValue: "",
				description: "",
			});
		}
	}, [setting, reset]);

	if (!open) return null;

	const onSubmit = async (values: SettingFormValues) => {
		await onSave(values);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
		>
			<div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
				<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
							<Sliders className="size-5" />
						</span>
						<div>
							<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								{isEditing ? "Ubah Pengaturan" : "Tambah Pengaturan Baru"}
							</h2>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{isEditing
									? "Perbarui nilai atau deskripsi parameter sistem ini"
									: "Tambahkan variabel konfigurasi baru ke dalam platform"}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
						aria-label="Tutup dialog"
					>
						<X className="size-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
					<div className="space-y-2">
						<Label htmlFor="settingKey" className="text-sm font-semibold">
							Kunci Pengaturan (Key) <span className="text-red-500">*</span>
						</Label>
						<Input
							id="settingKey"
							{...register("settingKey")}
							placeholder="Contoh: APP_NAME, MAINTENANCE_MODE, MAX_USERS"
							className="h-11 font-mono uppercase"
							disabled={isEditing}
						/>
						{isEditing && (
							<p className="text-[11px] text-slate-400">
								Kunci pengaturan tidak dapat diubah setelah dibuat untuk menjaga
								integritas sistem.
							</p>
						)}
						{errors.settingKey && (
							<p className="text-xs font-medium text-red-500">
								{errors.settingKey.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="settingValue" className="text-sm font-semibold">
							Nilai Pengaturan (Value)
						</Label>
						<textarea
							id="settingValue"
							{...register("settingValue")}
							placeholder="Masukkan nilai konfigurasi (string, angka, atau JSON)..."
							rows={3}
							className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 font-mono text-xs"
						/>
						{errors.settingValue && (
							<p className="text-xs font-medium text-red-500">
								{errors.settingValue.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description" className="text-sm font-semibold">
							Keterangan / Deskripsi
						</Label>
						<textarea
							id="description"
							{...register("description")}
							placeholder="Jelaskan fungsi dan tujuan pengaturan ini..."
							rows={2}
							className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
						/>
						{errors.description && (
							<p className="text-xs font-medium text-red-500">
								{errors.description.message}
							</p>
						)}
					</div>

					<div className="flex justify-end gap-3 pt-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSaving}
							className="h-10 px-4"
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={isSaving}
							className="h-10 bg-blue-700 px-5 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
						>
							{isSaving
								? "Menyimpan..."
								: isEditing
									? "Simpan Perubahan"
									: "Tambah Pengaturan"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
