import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
	type InstitutionFormValues,
	institutionFormSchema,
} from "../schemas/institutionSchema";
import type { Institution, InstitutionLevel } from "../types";

interface InstitutionDialogProps {
	open: boolean;
	institution?: Institution | null;
	levels: InstitutionLevel[];
	isSaving: boolean;
	onClose: () => void;
	onSave: (values: InstitutionFormValues) => Promise<void>;
}

const EMPTY_VALUES: InstitutionFormValues = {
	name: "",
	institutionLevelId: "",
	shortName: "",
	city: "",
	province: "",
	address: "",
	phoneNumber: "",
	email: "",
	website: "",
};

export function InstitutionDialog(props: InstitutionDialogProps) {
	const { open, institution, levels, isSaving, onClose, onSave } = props;
	const isEditing = Boolean(institution);
	const { register, handleSubmit, reset, formState } =
		useForm<InstitutionFormValues>({
			resolver: zodResolver(institutionFormSchema),
			defaultValues: EMPTY_VALUES,
		});
	const { errors } = formState;

	useEffect(() => {
		if (!open) return;
		if (institution) {
			reset({
				name: institution.name ?? "",
				institutionLevelId: institution.institutionLevelId ?? "",
				shortName: institution.shortName ?? "",
				city: institution.city ?? "",
				province: institution.province ?? "",
				address: institution.address ?? "",
				phoneNumber: institution.phoneNumber ?? "",
				email: institution.email ?? "",
				website: institution.website ?? "",
			});
		} else {
			reset(EMPTY_VALUES);
		}
	}, [institution, open, reset]);

	if (!open) return null;
	const onSubmit = async (values: InstitutionFormValues) => {
		await onSave(values);
	};
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
		>
			<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
				<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<span className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
							<Building2 className="size-5" />
						</span>
						<div>
							<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								{isEditing ? "Ubah Institusi" : "Tambah Institusi"}
							</h2>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{isEditing
									? "Perbarui data institusi yang sudah ada"
									: "Tambahkan institusi baru ke dalam sistem"}
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
						<Label htmlFor="institution-name" className="text-sm font-semibold">
							Nama Institusi <span className="text-red-500">*</span>
						</Label>
						<Input
							id="institution-name"
							{...register("name")}
							placeholder="Contoh: SMA Negeri 1 Surabaya"
							className="h-11"
						/>
						{errors.name && (
							<p className="text-xs font-medium text-red-500">
								{errors.name.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label
							htmlFor="institution-level"
							className="text-sm font-semibold"
						>
							Jenjang <span className="text-red-500">*</span>
						</Label>
						<Select
							id="institution-level"
							{...register("institutionLevelId")}
							className="h-11"
						>
							<option value="">Pilih jenjang institusi</option>
							{levels.map((level) => (
								<option key={level.id} value={level.id}>
									{level.name}
								</option>
							))}
						</Select>
						{errors.institutionLevelId && (
							<p className="text-xs font-medium text-red-500">
								{errors.institutionLevelId.message}
							</p>
						)}
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="institution-short-name"
								className="text-sm font-semibold"
							>
								Nama Singkat
							</Label>
							<Input
								id="institution-short-name"
								{...register("shortName")}
								placeholder="SMAN 1 SBY"
								className="h-11"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="institution-phone"
								className="text-sm font-semibold"
							>
								Nomor Telepon
							</Label>
							<Input
								id="institution-phone"
								{...register("phoneNumber")}
								placeholder="031-123456"
								className="h-11"
							/>
						</div>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="institution-city"
								className="text-sm font-semibold"
							>
								Kota
							</Label>
							<Input
								id="institution-city"
								{...register("city")}
								placeholder="Surabaya"
								className="h-11"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="institution-province"
								className="text-sm font-semibold"
							>
								Provinsi
							</Label>
							<Input
								id="institution-province"
								{...register("province")}
								placeholder="Jawa Timur"
								className="h-11"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label
							htmlFor="institution-email"
							className="text-sm font-semibold"
						>
							Email
						</Label>
						<Input
							id="institution-email"
							{...register("email")}
							placeholder="info@institusi.sch.id"
							className="h-11"
						/>
						{errors.email && (
							<p className="text-xs font-medium text-red-500">
								{errors.email.message}
							</p>
						)}
					</div>
					<div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSaving}
							className="h-10 px-4 text-sm font-semibold"
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={isSaving}
							className="h-10 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
						>
							{isSaving
								? "Menyimpan..."
								: isEditing
									? "Simpan Perubahan"
									: "Buat"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
