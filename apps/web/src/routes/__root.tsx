import { Outlet, createRootRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppSidebar, AppTopbar } from "@/components/app-sidebar";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
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
        <div className="text-sm font-semibold text-slate-500">Loading auth state...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
