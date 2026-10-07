import { Link, useNavigate } from "@tanstack/react-router";
import {
	Activity,
	Award,
	BookOpenCheck,
	Briefcase,
	ChevronRight,
	Church,
	ClipboardCheck,
	Globe,
	GraduationCap,
	KeyRound,
	LogOut,
	Settings2,
	ShieldCheck,
	UserRound,
	Users,
} from "lucide-react";
import { SkyToggle } from "@/components/ui/sky-toggle";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function AppSidebar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	// Visibility matrix: superadmin sees every built page EXCEPT Grades,
	// while every other role (admin/teacher/student/guardian) only sees Grades.
	const isSuperadmin = user?.role === "superadmin";

	return (
		<aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:flex">
			<div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-700">
				<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
					<BookOpenCheck className="h-4 w-4" />
				</span>
				<div>
					<p className="text-xs font-bold leading-none text-slate-900 dark:text-white">
						Sistem Academic
					</p>
					<p className="mt-1 text-[10px] text-slate-500">Enterprise v1.0</p>
				</div>
			</div>
			<nav className="space-y-1 p-3">
				{isSuperadmin && (
					<>
						<Link
							to="/nationalities"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<Globe className="h-3.5 w-3.5" />
							Nationalities
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/religions"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<Church className="h-3.5 w-3.5" />
							Religion
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/users"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<Users className="h-3.5 w-3.5" />
							Users Page
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/roles"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<ShieldCheck className="h-3.5 w-3.5" />
							Role Page
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/permissions"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<KeyRound className="h-3.5 w-3.5" />
							Permission Page
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/role-permissions"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<ShieldCheck className="h-3.5 w-3.5" />
							Role Permissions
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/jenjang-institusi"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<GraduationCap className="h-3.5 w-3.5" />
							Jenjang institusi
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/activity-logs"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<Activity className="h-3.5 w-3.5" />
							Activity Logs
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/employment-statuses"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<Briefcase className="h-3.5 w-3.5" />
							Employment Status
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/academic-statuses"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<BookOpenCheck className="h-3.5 w-3.5" />
							Academic Status
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/attendance-statuses"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<ClipboardCheck className="h-3.5 w-3.5" />
							Attendance Statuses
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
					</>
				)}
				{!isSuperadmin && (
					<Link
						to="/grades"
						activeProps={{
							className:
								"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
						}}
						className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						<Award className="h-3.5 w-3.5" />
						Grades
						<ChevronRight className="ml-auto h-3.5 w-3.5" />
					</Link>
				)}
				{isSuperadmin && (
					<>
						<Link
							to="/institutions"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<Briefcase className="h-3.5 w-3.5" />
							Institutions
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/specialization-statuses"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<BookOpenCheck className="h-3.5 w-3.5" />
							Specialization Status
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
						<Link
							to="/settings"
							activeProps={{
								className:
									"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold",
							}}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<Settings2 className="h-3.5 w-3.5" />
							Pengaturan
							<ChevronRight className="ml-auto h-3.5 w-3.5" />
						</Link>
					</>
				)}
			</nav>

			<div className="mt-auto border-t border-slate-200 p-3 dark:border-slate-700">
				<div className="flex items-center gap-2">
					<span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">
						SA
					</span>
					<div className="min-w-0 flex-1">
						<p className="truncate text-[10px] font-semibold text-slate-800 dark:text-slate-100">
							{user?.name || "Super Admin"}
						</p>
						<p className="truncate text-[9px] text-slate-500 dark:text-slate-400">
							{user?.email || "admin@akademik.id"}
						</p>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						title="Keluar dari sistem"
						className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
					>
						<LogOut className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>
		</aside>
	);
}

export function AppTopbar() {
	const { user } = useAuth();
	return (
		<header className="flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white px-5 dark:border-slate-700 dark:bg-slate-900">
			<SkyToggle />
			<button
				type="button"
				aria-label="Notifications"
				className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
			>
				<span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
				<UserRound className="h-4 w-4" />
			</button>
			<div className="flex items-center gap-2">
				<span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">
					SA
				</span>
				<span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline-block">
					{user?.name || "Super Admin"}
				</span>
			</div>
		</header>
	);
}
