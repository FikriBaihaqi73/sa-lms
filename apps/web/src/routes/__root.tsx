import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AppSidebar, AppTopbar } from "@/components/app-sidebar";

export const rootRoute = createRootRoute({
  component: () => <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900"><AppSidebar /><div className="min-w-0 flex-1"><AppTopbar /><Outlet /></div></div>,
});
