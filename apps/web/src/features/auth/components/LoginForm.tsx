import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@repo/shared/schemas/auth.schema";
import { useNavigate } from "@tanstack/react-router";
import { BookOpenCheck, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
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
import { useAuth } from "../hooks/useAuth";

type LoginFormValues = z.infer<typeof LoginSchema>;

export function LoginForm({
	onRegisterClick,
}: {
	onRegisterClick?: () => void;
}) {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: LoginFormValues) => {
		try {
			setError("");
			const user = await login(data);
			navigate({
				to:
					user.role === "superadmin"
						? "/users"
						: user.role === "admin"
							? "/users"
							: "/grades",
			});
		} catch (err) {
			const message =
				err instanceof Error && err.message
					? err.message
					: "Invalid credentials or login failed";
			setError(message);
		}
	};

	return (
		<Card className="w-full border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85">
			<CardHeader className="space-y-3 pb-6 text-center">
				<div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/25">
					<BookOpenCheck className="h-7 w-7" />
				</div>
				<div>
					<CardTitle className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
						Selamat Datang
					</CardTitle>
					<CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
						Masuk ke akun portal Sistem Academic Anda
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="px-6 pb-8 sm:px-8">
				{error && (
					<div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm font-medium text-red-700 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300">
						<span className="shrink-0 text-red-500">⚠️</span>
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-1.5">
						<Label
							htmlFor="email"
							className="text-xs font-semibold text-slate-700 dark:text-slate-300"
						>
							Email
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

					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<Label
								htmlFor="password"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300"
							>
								Kata Sandi
							</Label>
							<a
								href="#forgot"
								className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
							>
								Lupa kata sandi?
							</a>
						</div>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
								<Lock className="h-4 w-4" />
							</div>
							<Input
								id="password"
								{...register("password")}
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								autoComplete="current-password"
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

					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all mt-2"
					>
						{isSubmitting ? (
							<span className="flex items-center gap-2">
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Memproses...
							</span>
						) : (
							<span className="flex items-center gap-2">
								<Sparkles className="h-4 w-4" />
								Masuk ke Portal
							</span>
						)}
					</Button>

					{onRegisterClick && (
						<div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
							Belum memiliki akun?{" "}
							<button
								type="button"
								onClick={onRegisterClick}
								className="font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
							>
								Daftar sekarang
							</button>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
