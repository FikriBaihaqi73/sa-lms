import { createRoute } from "@tanstack/react-router";
import { settingsRoute } from '../../settingsLayout';
import { RolePermissionPage } from "@/features/permissions/components/RolePermissionPage";

export function RolePermissionsRouteComponent() {
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
  getParentRoute: () => settingsRoute,
  path: "/role-permissions",
  component: RolePermissionsRouteComponent,
});
