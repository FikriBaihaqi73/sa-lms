import { createRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { rootRoute } from "../__root";
import { RolePermissionPage } from "@/features/permissions/components/RolePermissionPage";

export function RolePermissionsRouteComponent() {
  const { user, isAuthenticated } = useAuth();

  const role = user?.role?.toLowerCase();
  
  // if (!isAuthenticated) {
  //   return (
  //     <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
  //       <div className="text-center space-y-3">
  //         <h1 className="text-2xl font-bold">Unauthorized</h1>
  //         <p className="text-sm text-slate-500">You must be logged in to access this page.</p>
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-[90rem] space-y-5">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight">Role Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and assign permissions for each role securely.</p>
        </header>
        <RolePermissionPage />
      </div>
    </main>
  );
}

export const rolePermissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/role-permissions",
  component: RolePermissionsRouteComponent,
});
