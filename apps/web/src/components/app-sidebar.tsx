import { BookOpenCheck, ChevronRight, KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SkyToggle } from "@/components/ui/sky-toggle";

export function AppSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white"><BookOpenCheck className="h-4 w-4" /></span>
        <div><p className="text-xs font-bold leading-none text-slate-900 dark:text-white">Sistem Academic</p><p className="mt-1 text-[10px] text-slate-500">Enterprise v1.0</p></div>
      </div>
      <nav className="p-3 space-y-1">
        <Link to="/roles" activeProps={{ className: "bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300" }} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><ShieldCheck className="h-3.5 w-3.5" />Role Page<ChevronRight className="ml-auto h-3.5 w-3.5" /></Link>
        <Link to="/permissions" activeProps={{ className: "bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300" }} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><KeyRound className="h-3.5 w-3.5" />Permission Page<ChevronRight className="ml-auto h-3.5 w-3.5" /></Link>
      </nav>
      <div className="mt-auto border-t border-slate-200 p-3 dark:border-slate-700"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">SA</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-800 dark:text-slate-100">Super Admin</p><p className="truncate text-[9px] text-slate-500 dark:text-slate-400">admin@akademik.id</p></div><LogOut className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-label="Sign out" /></div></div>
    </aside>
  );
}

export function AppTopbar() {
  return <header className="flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white px-5 dark:border-slate-700 dark:bg-slate-900"><SkyToggle /><button type="button" aria-label="Notifications" className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" /><UserRound className="h-4 w-4" /></button><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">SA</span></header>;
}
