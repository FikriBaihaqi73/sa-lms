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

// Pages restricted strictly to Superadmin
const SUPERADMIN_ONLY_PREFIXES = [
	"/roles",
	"/permissions",
	"/role-permissions",
	"/jenjang-institusi",
	"/religions",
	"/nationalities",
	"/academic-statuses",
	"/employment-statuses",
	"/specialization-statuses",
	"/attendance-statuses",
	"/institutions",
	"/superadmin",
];

// Pages accessible by Superadmin & Admin
const ADMIN_ACCESSIBLE_PREFIXES = [
	"/users",
	"/activity-logs",
	"/settings",
];

function AccessDenied({ message }: { message: string }) {
	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
			<AppSidebar />
			<div className="min-w-0 flex-1">
				<AppTopbar />
				<main className="mx-auto max-w-2xl p-6">
					<div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
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

	const role = user?.role?.toLowerCase() || "admin";
	const isSuperadmin = role === "superadmin";
	const isAdmin = role === "admin" || isSuperadmin;

	// Superadmin manages platform as a whole, not daily academic grades
	if (location.pathname.startsWith("/grades") && isSuperadmin) {
		return (
			<AccessDenied
				message="Halaman Nilai Akademik (Grades) tidak dikelola oleh Superadmin platform. Fitur ini khusus untuk Admin Institusi, Guru, dan Siswa."
			/>
		);
	}

	// Superadmin-only global master data & system access
	const isSuperadminOnlyRoute = SUPERADMIN_ONLY_PREFIXES.some((prefix) =>
		location.pathname.startsWith(prefix),
	);
	if (isSuperadminOnlyRoute && !isSuperadmin) {
		return (
			<AccessDenied
				message={`Halaman ini dikhususkan untuk Superadmin. Peran Anda (${role}) tidak memiliki hak akses.`}
			/>
		);
	}

	// Admin-level management routes (Users, Logs, Settings)
	const isAdminLevelRoute = ADMIN_ACCESSIBLE_PREFIXES.some((prefix) =>
		location.pathname.startsWith(prefix),
	);
	if (isAdminLevelRoute && !isAdmin) {
		return (
			<AccessDenied
				message={`Halaman ini membutuhkan hak akses Admin. Peran Anda (${role}) tidak memiliki hak akses.`}
			/>
		);
	}

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
			<AppSidebar />
			<div className="min-w-0 flex-1">
				<AppTopbar />
				<Outlet />
			</div>
		</div>
	);
}
