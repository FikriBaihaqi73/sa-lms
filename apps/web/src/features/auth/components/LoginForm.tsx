import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@repo/shared/schemas/auth.schema";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
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
	});

	const onSubmit = async (data: LoginFormValues) => {
		try {
			setError("");
			const user = await login(data);
			// Superadmin lands on the master-data pages; every other role only
			// has Grades, so send them straight there.
			navigate({
				to: user.role === "superadmin" ? "/nationalities" : "/grades",
			});
		} catch (err) {
			// Surface the real reason (e.g. missing profile/role, backend down)
			// instead of masking everything as invalid credentials.
			const message =
				err instanceof Error && err.message
					? err.message
					: "Invalid credentials or login failed";
			setError(message);
		}
	};

	return (
		<div className="flex min-h-[80vh] items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-xl border-zinc-200/80 dark:border-zinc-800">
				<CardHeader className="space-y-2 text-center pb-6">
					<CardTitle className="text-3xl font-bold tracking-tight">
						Welcome Back
					</CardTitle>
					<CardDescription className="text-base">
						Enter your email and password to sign in to your account
					</CardDescription>
				</CardHeader>
				<CardContent className="px-8 pb-8">
					{error && (
						<div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-2.5">
							<Label htmlFor="email" className="text-sm font-semibold">
								Email
							</Label>
							<Input
								id="email"
								{...register("email")}
								type="email"
								placeholder="name@example.com"
								autoComplete="email"
								className="h-11"
							/>
							{errors.email && (
								<p className="text-sm text-red-500 font-medium">
									{errors.email.message}
								</p>
							)}
						</div>

						<div className="space-y-2.5">
							<div className="flex items-center justify-between">
								<Label htmlFor="password" className="text-sm font-semibold">
									Password
								</Label>
								<a
									href="#forgot"
									className="text-sm font-medium text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
								>
									Forgot password?
								</a>
							</div>
							<div className="relative">
								<Input
									id="password"
									{...register("password")}
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									autoComplete="current-password"
									className="h-11 pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 focus:outline-none"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="text-sm text-red-500 font-medium">
									{errors.password.message}
								</p>
							)}
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full h-12 text-base font-semibold mt-4"
						>
							{isSubmitting ? "Signing in..." : "Sign in"}
						</Button>

						{onRegisterClick && (
							<div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
								Don't have an account?{" "}
								<button
									type="button"
									onClick={onRegisterClick}
									className="text-zinc-900 font-semibold underline-offset-4 hover:underline dark:text-zinc-100"
								>
									Sign up
								</button>
							</div>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
