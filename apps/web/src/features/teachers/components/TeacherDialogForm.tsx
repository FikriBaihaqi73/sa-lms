import { zodResolver } from "@hookform/resolvers/zod";
import {
	Copy,
	Eye,
	EyeOff,
	GraduationCap,
	KeyRound,
	RefreshCw,
	UserCheck,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
	type CreateTeacherFormValues,
	createTeacherSchema,
	type UpdateTeacherFormValues,
	updateTeacherSchema,
} from "../schemas/teacherSchema";
import type { Teacher, TeacherReference } from "../types";

interface TeacherDialogFormProps {
	open: boolean;
	teacher?: Teacher | null;
	statuses: TeacherReference[];
	specializations: TeacherReference[];
	departments: TeacherReference[];
	isSaving: boolean;
	onClose: () => void;
	onSaveCreate: (values: CreateTeacherFormValues) => Promise<void>;
	onSaveUpdate: (id: string, values: UpdateTeacherFormValues) => Promise<void>;
}

function generateRandomPassword(length = 10): string {
	const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export function TeacherDialogForm({
	open,
	teacher,
	statuses,
	specializations,
	departments,
	isSaving,
	onClose,
	onSaveCreate,
	onSaveUpdate,
}: TeacherDialogFormProps) {
	const isEdit = Boolean(teacher);
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<CreateTeacherFormValues | UpdateTeacherFormValues>({
		resolver: zodResolver(isEdit ? updateTeacherSchema : createTeacherSchema),
		defaultValues: {
			full_name: "",
			email: "",
			password: "",
			gender: "",
			phone: "",
			teacher_number: "",
			join_date: "",
			employment_status_id: "",
			specialization_id: "",
			department_id: "",
		},
	});

	const currentPassword = watch("password") || "";

	useEffect(() => {
		if (!open) return;
		if (teacher) {
			reset({
				full_name: teacher.profile?.fullName ?? "",
				email: teacher.profile?.users?.email ?? teacher.profile?.email ?? "",
				password: "",
				gender: teacher.profile?.gender ?? "",
				phone: teacher.profile?.phoneNumber ?? "",
				teacher_number: teacher.teacher_number ?? "",
				join_date: teacher.join_date ? teacher.join_date.slice(0, 10) : "",
				employment_status_id: teacher.employment_status_id ?? "",
				specialization_id: teacher.specialization_id ?? "",
				department_id: teacher.department_id ?? "",
			});
		} else {
			reset({
				full_name: "",
				email: "",
				password: generateRandomPassword(10),
				gender: "",
				phone: "",
				teacher_number: "",
				join_date: new Date().toISOString().slice(0, 10),
				employment_status_id: "",
				specialization_id: "",
				department_id: "",
			});
		}
	}, [open, teacher, reset]);

	if (!open) return null;

	const handleGeneratePassword = () => {
		const generated = generateRandomPassword(10);
		setValue("password", generated, { shouldValidate: true });
		setShowPassword(true);
		toast.info("Password baru berhasil di-generate!");
	};

	const handleCopyPassword = async () => {
		if (!currentPassword) {
			toast.warning("Password masih kosong.");
			return;
		}
		try {
			await navigator.clipboard.writeText(currentPassword);
			toast.success("Password disalin ke clipboard!");
		} catch {
			toast.error("Gagal menyalin password.");
		}
	};

	const onSubmit = async (
		data: CreateTeacherFormValues | UpdateTeacherFormValues,
	) => {
		if (isEdit && teacher) {
			await onSaveUpdate(teacher.id, data as UpdateTeacherFormValues);
		} else {
			await onSaveCreate(data as CreateTeacherFormValues);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
		>
			<div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
				{/* Header Modal */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
					<div className="flex items-center gap-3">
						<span className="flex size-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
							<GraduationCap className="size-5" />
						</span>
						<div>
							<h2 className="text-lg font-bold text-slate-900 dark:text-white">
								{isEdit ? "Edit Data Guru" : "Tambah Guru Baru"}
							</h2>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{isEdit
									? "Perbarui identitas profil, akun login, atau data kepegawaian guru."
									: "Buat akun login, identitas profil, dan data kepegawaian guru sekaligus."}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
						aria-label="Tutup dialog"
					>
						<X className="size-5" />
					</button>
				</div>

				{/* Form Body */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
					{/* ================= BAGIAN 1 ================= */}
					<div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
						<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
							<UserCheck className="size-4" />
							<h3 className="text-xs font-bold uppercase tracking-wider">
								Bagian 1 — Akun Login &amp; Identitas (Users &amp; Profile)
							</h3>
						</div>

						<div className="space-y-3">
							{/* Nama Lengkap */}
							<div className="space-y-1.5">
								<Label
									htmlFor="teacher-fullname"
									className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
								>
									Nama Lengkap Guru <span className="text-red-500">*</span>
								</Label>
								<Input
									id="teacher-fullname"
									type="text"
									placeholder="Contoh: Dra. Siti Rahmawati, M.Pd"
									{...register("full_name")}
									className="h-10"
								/>
								{errors.full_name && (
									<p className="text-xs text-red-500">
										{errors.full_name.message}
									</p>
								)}
							</div>

							{/* Email Login */}
							<div className="space-y-1.5">
								<Label
									htmlFor="teacher-email"
									className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
								>
									Email Login <span className="text-red-500">*</span>
								</Label>
								<Input
									id="teacher-email"
									type="email"
									placeholder="Contoh: guru@sekolah.sch.id"
									{...register("email")}
									className="h-10"
								/>
								{errors.email && (
									<p className="text-xs text-red-500">{errors.email.message}</p>
								)}
							</div>

							{/* Password Awal */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label
										htmlFor="teacher-password"
										className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
									>
										Password {isEdit ? "(Opsional)" : "Awal"}{" "}
										{!isEdit && <span className="text-red-500">*</span>}
									</Label>
									<div className="flex items-center gap-1">
										<button
											type="button"
											onClick={handleGeneratePassword}
											className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60"
											title="Generate password acak 10 karakter"
										>
											<RefreshCw className="size-3" /> Generate
										</button>
										<button
											type="button"
											onClick={handleCopyPassword}
											className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
											title="Salin password"
										>
											<Copy className="size-3" /> Salin
										</button>
									</div>
								</div>

								<div className="relative">
									<Input
										id="teacher-password"
										type={showPassword ? "text" : "password"}
										placeholder={
											isEdit
												? "Kosongkan jika tidak ingin mengubah password..."
												: "Minimal 8 karakter..."
										}
										{...register("password")}
										className="h-10 pr-10 font-mono text-sm"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
										aria-label={
											showPassword ? "Sembunyikan password" : "Lihat password"
										}
									>
										{showPassword ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</button>
								</div>
								{errors.password && (
									<p className="text-xs text-red-500">
										{errors.password.message}
									</p>
								)}
								{isEdit && (
									<p className="text-[11px] text-slate-400 dark:text-slate-500">
										Biarkan kosong jika tidak ingin mengubah kata sandi akun
										guru ini.
									</p>
								)}
							</div>

							{/* Grid 2 Kolom: Jenis Kelamin & No. Telepon */}
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label
										htmlFor="teacher-gender"
										className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
									>
										Jenis Kelamin
									</Label>
									<Select
										id="teacher-gender"
										{...register("gender")}
										className="h-10"
									>
										<option value="">Pilih jenis kelamin</option>
										<option value="Laki-laki">Laki-laki</option>
										<option value="Perempuan">Perempuan</option>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label
										htmlFor="teacher-phone"
										className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
									>
										No. Telepon / WhatsApp
									</Label>
									<Input
										id="teacher-phone"
										type="tel"
										placeholder="Contoh: 081234567890"
										{...register("phone")}
										className="h-10"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* ================= BAGIAN 2 ================= */}
					<div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
						<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
							<KeyRound className="size-4" />
							<h3 className="text-xs font-bold uppercase tracking-wider">
								Bagian 2 — Data Kepegawaian (Teachers)
							</h3>
						</div>

						<div className="space-y-3">
							{/* Grid 2 Kolom: NIP & Tanggal Bergabung */}
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label
										htmlFor="teacher-number"
										className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
									>
										NIP / No. Guru <span className="text-red-500">*</span>
									</Label>
									<Input
										id="teacher-number"
										type="text"
										placeholder="Contoh: 198501012010011001"
										{...register("teacher_number")}
										className="h-10 font-mono"
									/>
									{errors.teacher_number && (
										<p className="text-xs text-red-500">
											{errors.teacher_number.message}
										</p>
									)}
								</div>

								<div className="space-y-1.5">
									<Label
										htmlFor="teacher-joindate"
										className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
									>
										Tanggal Bergabung
									</Label>
									<Input
										id="teacher-joindate"
										type="date"
										{...register("join_date")}
										className="h-10"
									/>
								</div>
							</div>

							{/* Grid 2 Kolom: Status Kepegawaian & Spesialisasi */}
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label
										htmlFor="teacher-status"
										className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
									>
										Status Kepegawaian
									</Label>
									<Select
										id="teacher-status"
										{...register("employment_status_id")}
										className="h-10"
									>
										<option value="">Pilih status</option>
										{statuses.map((status) => (
											<option key={status.id} value={status.id}>
												{status.name}
											</option>
										))}
									</Select>
								</div>

								<div className="space-y-1.5">
									<Label
										htmlFor="teacher-specialization"
										className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
									>
										Spesialisasi Mapel
									</Label>
									<Select
										id="teacher-specialization"
										{...register("specialization_id")}
										className="h-10"
									>
										<option value="">Pilih spesialisasi</option>
										{specializations.map((spec) => (
											<option key={spec.id} value={spec.id}>
												{spec.name}
											</option>
										))}
									</Select>
								</div>
							</div>

							{/* Departemen Full Width */}
							<div className="space-y-1.5">
								<Label
									htmlFor="teacher-department"
									className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
								>
									Departemen / Unit
								</Label>
								<Select
									id="teacher-department"
									{...register("department_id")}
									className="h-10"
								>
									<option value="">Pilih departemen</option>
									{departments.map((dept) => (
										<option key={dept.id} value={dept.id}>
											{dept.name} {dept.code ? `(${dept.code})` : ""}
										</option>
									))}
								</Select>
							</div>
						</div>
					</div>

					{/* Footer Actions */}
					<div className="flex items-center justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSaving}
							className="border-slate-200 dark:border-slate-800"
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={isSaving}
							className="bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
						>
							{isSaving
								? "Menyimpan..."
								: isEdit
									? "Simpan Perubahan"
									: "Simpan & Buat Akun"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
