import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@repo/shared/schemas/auth.schema";
import {
	Building2,
	Eye,
	EyeOff,
	GraduationCap,
	Lock,
	Mail,
	School,
	Sparkles,
	UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerApi } from "../api/register";

const FrontendRegisterSchema = RegisterSchema.extend({
	confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Konfirmasi kata sandi tidak cocok",
	path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof FrontendRegisterSchema>;

export function RegisterForm({ onLoginClick }: { onLoginClick: () => void }) {
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		register,
		control,
		setValue,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(FrontendRegisterSchema),
		defaultValues: {
			role: "student",
			email: "",
			password: "",
			confirmPassword: "",
			institutionName: "",
		},
	});

	const selectedRole = useWatch({ control, name: "role" });

	const onSubmit = async (data: RegisterFormValues) => {
		try {
			setError("");
			setSuccess("");
			await registerApi({
				email: data.email,
				password: data.password,
				role: data.role,
				institutionName: data.institutionName,
			});
			setSuccess("Akun berhasil dibuat! Silakan masuk dengan akun baru Anda.");
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "Pendaftaran gagal dilakukan",
			);
		}
	};

	return (
		<Card className="w-full border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85">
			<CardHeader className="space-y-3 pb-6 text-center">
				<div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/25">
					<UserPlus className="h-7 w-7" />
				</div>
				<div>
					<CardTitle className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
						Buat Akun Baru
					</CardTitle>
					<CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Daftar untuk mengakses sistem manajemen akademik dan platform
						pembelajaran
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="px-6 pb-8 sm:px-10">
				{error && (
					<div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm font-medium text-red-700 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300">
						<span className="shrink-0 text-red-500">⚠️</span>
						<span>{error}</span>
					</div>
				)}
				{success && (
					<div className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-sm font-medium text-emerald-700 backdrop-blur-sm dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300">
						<span className="shrink-0 text-emerald-500">✓</span>
						<span>{success}</span>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					{/* Role Selector Tabs */}
					<div className="space-y-2">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Daftar Sebagai Peran
						</Label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() =>
									setValue("role", "student", { shouldValidate: true })
								}
								className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-sm font-medium transition-all ${
									selectedRole === "student"
										? "border-blue-600 bg-blue-50/90 text-blue-700 shadow-sm ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-300"
										: "border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 dark:hover:border-slate-700"
								}`}
							>
								<GraduationCap className="h-4 w-4 shrink-0" />
								<span>Siswa / Murid</span>
							</button>

							<button
								type="button"
								onClick={() =>
									setValue("role", "instansi", { shouldValidate: true })
								}
								className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-sm font-medium transition-all ${
									selectedRole === "instansi"
										? "border-blue-600 bg-blue-50/90 text-blue-700 shadow-sm ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-300"
										: "border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 dark:hover:border-slate-700"
								}`}
							>
								<Building2 className="h-4 w-4 shrink-0" />
								<span>Instansi / Sekolah</span>
							</button>
						</div>
						{/* Hidden input for react-hook-form registration */}
						<input type="hidden" {...register("role")} />
						{errors.role && (
							<p className="text-xs font-medium text-red-500">
								{errors.role.message}
							</p>
						)}
					</div>

					{/* Responsive Wider Form Grid */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{/* Email Field - spans full width or conditionally with Institution */}
						<div
							className={`space-y-1.5 ${
								selectedRole === "instansi" ? "sm:col-span-1" : "sm:col-span-2"
							}`}
						>
							<Label
								htmlFor="email"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300"
							>
								Alamat Email
							</Label>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
									<Mail className="h-4 w-4" />
								</div>
								<Input
									id="email"
									{...register("email")}
									type="email"
									placeholder="nama@email.com"
									autoComplete="email"
									className="h-11 pl-9 rounded-lg border-slate-200 bg-white/80 transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/70 dark:focus:bg-slate-950"
								/>
							</div>
							{errors.email && (
								<p className="text-xs font-medium text-red-500">
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Institution Field (Visible only when role is instansi) */}
						{selectedRole === "instansi" && (
							<div className="space-y-1.5 sm:col-span-1">
								<Label
									htmlFor="institutionName"
									className="text-xs font-semibold text-slate-700 dark:text-slate-300"
								>
									Nama Lembaga / Sekolah
								</Label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
										<School className="h-4 w-4" />
									</div>
									<Input
										id="institutionName"
										{...register("institutionName")}
										type="text"
										placeholder="SMA Negeri 1 ..."
										className="h-11 pl-9 rounded-lg border-slate-200 bg-white/80 transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/70 dark:focus:bg-slate-950"
									/>
								</div>
								{errors.institutionName && (
									<p className="text-xs font-medium text-red-500">
										{errors.institutionName.message}
									</p>
								)}
							</div>
						)}

						{/* Password Field */}
						<div className="space-y-1.5 sm:col-span-1">
							<Label
								htmlFor="password"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300"
							>
								Kata Sandi (Min. 8 Karakter)
							</Label>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
									<Lock className="h-4 w-4" />
								</div>
								<Input
									id="password"
									{...register("password")}
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									autoComplete="new-password"
									className="h-11 pl-9 pr-10 rounded-lg border-slate-200 bg-white/80 transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/70 dark:focus:bg-slate-950"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="text-xs font-medium text-red-500">
									{errors.password.message}
								</p>
							)}
						</div>

						{/* Confirm Password Field */}
						<div className="space-y-1.5 sm:col-span-1">
							<Label
								htmlFor="confirmPassword"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300"
							>
								Ulangi Kata Sandi
							</Label>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
									<Lock className="h-4 w-4" />
								</div>
								<Input
									id="confirmPassword"
									{...register("confirmPassword")}
									type={showConfirmPassword ? "text" : "password"}
									placeholder="••••••••"
									autoComplete="new-password"
									className="h-11 pl-9 pr-10 rounded-lg border-slate-200 bg-white/80 transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/70 dark:focus:bg-slate-950"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<p className="text-xs font-medium text-red-500">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all mt-3"
					>
						{isSubmitting ? (
							<span className="flex items-center gap-2">
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Mendaftarkan Akun...
							</span>
						) : (
							<span className="flex items-center gap-2">
								<Sparkles className="h-4 w-4" />
								Daftar Sekarang
							</span>
						)}
					</Button>

					<div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
						Sudah memiliki akun?{" "}
						<button
							type="button"
							onClick={onLoginClick}
							className="font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
						>
							Masuk di sini
						</button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
