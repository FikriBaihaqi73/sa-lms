import { useDeferredValue, useMemo, useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddRoleDialog } from "@/features/roles/components/AddRoleDialog";
import { DeleteRoleDialog } from "@/features/roles/components/DeleteRoleDialog";
import { EditRoleSheet } from "@/features/roles/components/EditRoleSheet";
import { RoleFilterBar } from "@/features/roles/components/RoleFilterBar";
import { RoleStatsCards } from "@/features/roles/components/RoleStatsCards";
import { RolesTable } from "@/features/roles/components/RolesTable";
import { useCreateRole } from "@/features/roles/hooks/useCreateRole";
import { useDeleteRole } from "@/features/roles/hooks/useDeleteRole";
import { usePermissions } from "@/features/roles/hooks/usePermissions";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { useUpdateRole } from "@/features/roles/hooks/useUpdateRole";
import type { Role, RoleFormValues, RoleTypeFilter } from "@/features/roles/types";
import { rootRoute } from "../__root";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

export function RolesPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [type, setType] = useState<RoleTypeFilter>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const permissionsQuery = usePermissions();
  const rolesQuery = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const permissions = useMemo(() => permissionsQuery.data ?? [], [permissionsQuery.data]);
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const filteredRoles = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return roles.filter((role) => {
      const matchesSearch = !query || role.name.toLowerCase().includes(query);
      const matchesType = type === "all" || (type === "system" ? role.isSystemRole : !role.isSystemRole);
      return matchesSearch && matchesType;
    });
  }, [deferredSearch, roles, type]);

  async function saveNewRole(values: RoleFormValues) {
    try {
      await createMutation.mutateAsync(values);
      setIsAdding(false);
      setNotice({ kind: "success", message: "Perubahan berhasil disimpan" });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  async function saveEditedRole(values: RoleFormValues) {
    if (!editingRole) return;
    try {
      await updateMutation.mutateAsync({ id: editingRole.id, values });
      setEditingRole(null);
      setNotice({ kind: "success", message: "Perubahan berhasil disimpan" });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  async function confirmDelete() {
    if (!deletingRole) return;
    try {
      await deleteMutation.mutateAsync(deletingRole.id);
      setDeletingRole(null);
      setNotice({ kind: "success", message: "Perubahan berhasil disimpan" });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-lg font-bold tracking-tight">Roles Page</h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage role access and permission assignments.</p></div><Button className="h-8 bg-blue-700 px-3 text-xs hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600" onClick={() => setIsAdding(true)}><Plus className="h-3.5 w-3.5" /> Add Role</Button></header>
        <RoleStatsCards roles={roles} permissions={permissions} />
        <RoleFilterBar search={search} type={type} onSearchChange={setSearch} onTypeChange={setType} />
        {rolesQuery.isError || permissionsQuery.isError ? <div className="rounded-lg border border-destructive/40 bg-red-50 p-4 text-sm text-destructive dark:bg-red-950/30">{errorMessage(rolesQuery.error ?? permissionsQuery.error)}</div> : <RolesTable roles={filteredRoles} isLoading={rolesQuery.isPending || permissionsQuery.isPending} onEdit={setEditingRole} onDelete={setDeletingRole} onAdd={() => setIsAdding(true)} />}
      </div>
      {notice && <div role="status" className={notice.kind === "success" ? "fixed bottom-5 right-5 z-[70] rounded-lg bg-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg" : "fixed bottom-5 right-5 z-[70] rounded-lg bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground shadow-lg"}>{notice.message}</div>}
      {isAdding && <AddRoleDialog open permissions={permissions} isSaving={createMutation.isPending} onClose={() => setIsAdding(false)} onSave={saveNewRole} />}
      {editingRole && <EditRoleSheet key={editingRole.id} open role={editingRole} permissions={permissions} isSaving={updateMutation.isPending} onClose={() => setEditingRole(null)} onSave={saveEditedRole} />}
      <DeleteRoleDialog role={deletingRole} isDeleting={deleteMutation.isPending} onClose={() => setDeletingRole(null)} onConfirm={confirmDelete} />
    </main>
  );
}

// Route configuration is colocated with its file-based route component.
// eslint-disable-next-line react-refresh/only-export-components
export const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/roles",
  component: RolesPage,
});
