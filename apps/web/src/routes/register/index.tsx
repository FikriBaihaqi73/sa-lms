import { createRoute, useNavigate } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { rootRoute } from "../__root";

export const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/register",
	component: function RegisterPage() {
		const navigate = useNavigate();
		return (
			<div
				className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8 bg-cover bg-center bg-no-repeat transition-colors"
				style={{
					backgroundImage: `url('/images/background-auth.webp')`,
				}}
			>
				{/* Ambient blur & gradient overlay */}
				<div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] dark:bg-slate-950/70" />

				{/* Content card (wider max-w-2xl for register form layout) */}
				<div className="relative z-10 w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-300">
					<RegisterForm onLoginClick={() => navigate({ to: "/login" })} />
				</div>
			</div>
		);
	},
});
