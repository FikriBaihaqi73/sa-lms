import {
	createRootRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AppSidebar, AppTopbar } from "@/components/app-sidebar";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const rootRoute = createRootRoute({
	component: RootLayout,
});

// Pages that only superadmin may open (everything except Grades).
const SUPERADMIN_ONLY_PREFIXES = [
	"/nationalities",
	"/religions",
	"/users",
	"/roles",
	"/role-permissions",
	"/jenjang-institusi",
	"/activity-logs",
	"/employment-statuses",
	"/academic-statuses",
	"/institutions",
	"/specialization-statuses",
	"/attendance-statuses",
	"/assignment-types",
	"/settings",
	"/superadmin",
];

function AccessDenied({ message }: { message: string }) {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
			<AppSidebar />
			<div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
				<AppTopbar />
				<main className="flex-1 overflow-y-auto p-6">
					<div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
						<p className="text-lg font-bold text-slate-900 dark:text-slate-50">
							403 — Akses ditolak
						</p>
						<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
							{message}
						</p>
					</div>
				</main>
			</div>
		</div>
	);
}

function RootLayout() {
	const { isAuthenticated, isLoading, user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const isAuthPage =
		location.pathname === "/login" || location.pathname === "/register";
	useEffect(() => {
		if (!isLoading && !isAuthenticated && !isAuthPage) {
			navigate({ to: "/login" });
		}
	}, [isAuthenticated, isLoading, isAuthPage, navigate]);

	if (isAuthPage) {
		return <Outlet />;
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
				<div className="text-sm font-semibold text-slate-500">
					Loading auth state...
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	// Visibility matrix: superadmin sees every page EXCEPT Grades; every other
	// role (admin/teacher/student/guardian) only sees Grades. Bounce direct
	// URL visits that break the matrix.
	const isSuperadmin = user?.role === "superadmin";

	if (location.pathname.startsWith("/grades") && isSuperadmin) {
		return (
			<AccessDenied
				message={`Halaman Grades tidak tersedia untuk peran superadmin. Akun Anda (${user?.role ?? "tanpa peran"}) tidak memiliki akses.`}
			/>
		);
	}

	const onSuperadminOnlyPage = SUPERADMIN_ONLY_PREFIXES.some((prefix) =>
		location.pathname.startsWith(prefix),
	);
	if (onSuperadminOnlyPage && !isSuperadmin) {
		return (
			<AccessDenied
				message={`Halaman ini hanya untuk peran superadmin. Akun Anda (${user?.role ?? "tanpa peran"}) tidak memiliki akses.`}
			/>
		);
	}

	return (
		<div className="flex h-screen w-full overflow-hidden bg-[#F1F5F9] dark:bg-[#0B1220]">
			<AppSidebar />
			<div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
				<AppTopbar />
				<div className="flex-1 overflow-y-auto">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
