import { createRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { rootRoute } from "../__root";

export const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: function LoginPage() {
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

				{/* Content card */}
				<div className="relative z-10 w-full max-w-md my-auto animate-in fade-in zoom-in-95 duration-300">
					<LoginForm onRegisterClick={() => navigate({ to: "/register" })} />
				</div>
			</div>
		);
	},
});
