import { Link, useNavigate } from "@tanstack/react-router";
import {
	Activity,
	Award,
	BookOpen,
	BookOpenCheck,
	Briefcase,
	ChevronRight,
	Church,
	ClipboardCheck,
	Globe,
	GraduationCap,
	HeartHandshake,
	KeyRound,
	LogOut,
	Settings2,
	ShieldCheck,
	UserRound,
	Users,
	type LucideIcon,
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

	const role = user?.role?.toLowerCase() || "admin";
	const isSuperadmin = role === "superadmin";
	const isAdmin = role === "admin" || !user?.role;
	const isStudentOrTeacher = role === "student" || role === "teacher" || role === "guardian";

	return (
		<aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
			{/* Brand Header */}
			<div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5 dark:border-slate-800">
				<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md">
					<BookOpenCheck className="h-5 w-5" />
				</span>
				<div>
					<p className="text-xs font-bold leading-none text-slate-900 dark:text-white">
						Sistem Academic
					</p>
					<p className="mt-1 text-[10px] font-medium text-slate-500">
						{isSuperadmin ? "Superadmin Portal" : isAdmin ? "Institution Admin" : "Academic Portal"}
					</p>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto p-3 space-y-4">
				{/* 👑 SUPERADMIN SECTION */}
				{isSuperadmin && (
					<>
						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								System & Access
							</p>
							<div className="space-y-0.5">
								<NavItem to="/users" icon={Users} label="Users Management" />
								<NavItem to="/roles" icon={ShieldCheck} label="Roles" />
								<NavItem to="/permissions" icon={KeyRound} label="Permissions" />
								<NavItem to="/role-permissions" icon={ShieldCheck} label="Role Permissions" />
								<NavItem to="/activity-logs" icon={Activity} label="Activity Logs" />
								<NavItem to="/settings" icon={Settings2} label="Settings" />
							</div>
						</div>

						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								Master Data Global
							</p>
							<div className="space-y-0.5">
								<NavItem to="/jenjang-institusi" icon={GraduationCap} label="Institution Levels" />
								<NavItem to="/religions" icon={Church} label="Religions" />
								<NavItem to="/nationalities" icon={Globe} label="Nationalities" />
								<NavItem to="/academic-statuses" icon={BookOpenCheck} label="Academic Statuses" />
								<NavItem to="/employment-statuses" icon={Briefcase} label="Employment Statuses" />
								<NavItem to="/specialization-statuses" icon={BookOpenCheck} label="Specialization Statuses" />
								<NavItem to="/assignment-types" icon={BookOpen} label="Assignment Types" />
								<NavItem to="/attendance-statuses" icon={ClipboardCheck} label="Attendance Statuses" />
								<NavItem to="/academic-years" icon={BookOpen} label="Academic Years" />
							</div>
						</div>

						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								Institution Management
							</p>
							<div className="space-y-0.5">
								<NavItem to="/institutions" icon={Briefcase} label="Institutions" />
								<NavItem to="/profile" icon={UserRound} label="Profil Saya" />
							</div>
						</div>
					</>
				)}

				{/* 🛠️ INSTITUTION ADMIN SECTION */}
				{isAdmin && !isSuperadmin && (
					<>
						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								User Management
							</p>
							<div className="space-y-0.5">
								<NavItem to="/users" icon={Users} label="Data Pengguna (Users)" />
								<NavItem to="/students" icon={GraduationCap} label="Students" />
								<NavItem to="/teachers" icon={Briefcase} label="Guru / Teachers" />
								<NavItem to="/guardians" icon={HeartHandshake} label="Wali Murid / Guardians" />
								<NavItem to="/profile" icon={UserRound} label="Profil Saya" />
							</div>
						</div>

						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								Academic Configuration
							</p>
							<div className="space-y-0.5">
								<NavItem to="/grades" icon={Award} label="Manajemen Nilai (Grades)" />
								<NavItem to="/academic-years" icon={BookOpen} label="Tahun Ajaran (Academic Years)" />
							</div>
						</div>

						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								Sistem & Pengaturan
							</p>
							<div className="space-y-0.5">
								<NavItem to="/activity-logs" icon={Activity} label="Activity Logs" />
								<NavItem to="/settings" icon={Settings2} label="Pengaturan" />
							</div>
						</div>
					</>
				)}

				{/* 🎓 STUDENT / TEACHER SECTION */}
				{isStudentOrTeacher && (
					<>
						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								My Profile
							</p>
							<div className="space-y-0.5">
								<NavItem to="/profile" icon={UserRound} label="Profil Saya" />
							</div>
						</div>

						<div>
							<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
								Academic & Assessment
							</p>
							<div className="space-y-0.5">
								<NavItem to="/grades" icon={Award} label="Nilai Akademik (Grades)" />
							</div>
						</div>
					</>
				)}
			</nav>

			{/* User Profile Footer */}
			<div className="mt-auto shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
				<div className="flex items-center gap-2">
					<Link to="/profile" className="flex flex-1 items-center gap-2.5 min-w-0 hover:opacity-80 transition">
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
							{user?.name?.slice(0, 2).toUpperCase() || "SA"}
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
								{user?.name || (isSuperadmin ? "Super Admin" : "Admin Institusi")}
							</p>
							<p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
								{user?.email || "admin@nexora.com"}
							</p>
						</div>
					</Link>
					<button
						type="button"
						onClick={handleLogout}
						title="Keluar dari sistem"
						className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
					>
						<LogOut className="h-4 w-4" />
					</button>
				</div>
			</div>
		</aside>
	);
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
	return (
		<Link
			to={to}
			activeProps={{
				className:
					"bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold shadow-sm",
			}}
			className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
		>
			<Icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
			<span className="truncate">{label}</span>
			<ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-40" />
		</Link>
	);
}

export function AppTopbar() {
	const { user } = useAuth();
	return (
		<header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
			<SkyToggle />
			<button
				type="button"
				aria-label="Notifications"
				className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
			>
				<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
				<UserRound className="h-4 w-4" />
			</button>
			<Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition">
				<span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
					{user?.name?.slice(0, 2).toUpperCase() || "SA"}
				</span>
				<span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline-block">
					{user?.name || "Admin Institusi"}
				</span>
			</Link>
		</header>
	);
}
