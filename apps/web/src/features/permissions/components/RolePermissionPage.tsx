import React, { useMemo, useState, useEffect } from "react";
import { usePermissions } from "@/features/roles/hooks/usePermissions";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { useUpdateRole } from "@/features/roles/hooks/useUpdateRole";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Search } from "lucide-react";
import type { Permission, Role } from "@/features/roles/types";

export function RolePermissionPage() {
  const permissionsQuery = usePermissions();
  const rolesQuery = useRoles();
  const updateMutation = useUpdateRole();

  const permissions = useMemo(() => permissionsQuery.data ?? [], [permissionsQuery.data]);
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dirtyPermissions, setDirtyPermissions] = useState<string[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const selectedRole = useMemo(() => roles.find((r) => r.id === selectedRoleId) ?? null, [roles, selectedRoleId]);

  // When a new role is selected, clear dirty state and initialize with the role's current permissions
  useEffect(() => {
    if (selectedRole) {
      setDirtyPermissions(selectedRole.permissionIds ?? []);
      setNotice(null);
    } else {
      setDirtyPermissions(null);
    }
  }, [selectedRole]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
      (groups[permission.module] ??= []).push(permission);
      return groups;
    }, {});
  }, [permissions]);

  if (permissionsQuery.isLoading || rolesQuery.isLoading) {
    return <div className="p-4 text-sm text-slate-500">Loading role permissions...</div>;
  }

  if (permissionsQuery.isError || rolesQuery.isError) {
    return <div className="p-4 text-sm text-destructive">Failed to load data.</div>;
  }

  const togglePermission = (permissionId: string, checked: boolean) => {
    if (!dirtyPermissions) return;
    setDirtyPermissions(
      checked ? [...dirtyPermissions, permissionId] : dirtyPermissions.filter((id) => id !== permissionId)
    );
  };

  const toggleModule = (modulePermissions: Permission[], checked: boolean) => {
    if (!dirtyPermissions) return;
    const moduleIds = new Set(modulePermissions.map((p) => p.id));
    const remaining = dirtyPermissions.filter((id) => !moduleIds.has(id));
    setDirtyPermissions(checked ? [...new Set([...remaining, ...moduleIds])] : remaining);
  };

  const saveChanges = async () => {
    if (!selectedRole || !dirtyPermissions) return;
    setIsSaving(true);
    setNotice(null);
    try {
      await updateMutation.mutateAsync({
        id: selectedRole.id,
        values: {
          name: selectedRole.name,
          description: selectedRole.description ?? "",
          permissionIds: dirtyPermissions,
        },
      });
      setNotice({ kind: "success", message: "Permissions updated successfully" });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Failed to save permissions" });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const hasChanges =
    selectedRole && dirtyPermissions && JSON.stringify(dirtyPermissions.sort()) !== JSON.stringify([...(selectedRole.permissionIds ?? [])].sort());

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Left Sidebar: Role Selection */}
      <div className="flex w-full flex-col gap-4 md:w-80 shrink-0">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
          <div className="border-b border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Select Role</h2>
            <p className="mt-1 text-xs text-slate-500">Choose a role to manage its permissions</p>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredRoles.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">No roles found.</p>
            ) : (
              filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedRoleId === role.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <ShieldCheck className={`h-4 w-4 ${selectedRoleId === role.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                  <span className="font-medium truncate">{role.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Content: Permission Assignment */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 flex flex-col h-[calc(100vh-10rem)]">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:px-6 dark:border-slate-700">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedRole ? `Permissions for ${selectedRole.name}` : "Role Permissions"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {selectedRole ? "Assign or unassign permissions for the selected role" : "Select a role from the list to view its permissions"}
              </p>
            </div>
            {selectedRole && (
              <Button
                size="sm"
                className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
                disabled={!hasChanges || isSaving || selectedRole.isSystemRole}
                onClick={saveChanges}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
            {notice && (
              <div className={`mb-6 rounded-lg p-4 text-sm font-medium ${notice.kind === "success" ? "bg-blue-50 text-blue-700 border border-blue-200 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300" : "bg-red-50 text-red-700 border border-red-200 dark:border-red-900 dark:bg-red-950 dark:text-red-300"}`}>
                {notice.message}
              </div>
            )}

            {!selectedRole ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <ShieldCheck className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No role selected</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">Please select a role from the list on the left to manage its permissions.</p>
              </div>
            ) : dirtyPermissions === null ? (
              <div className="p-4 text-sm text-slate-500">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(groupedPermissions).map(([module, items]) => {
                  const allSelected = items.every((p) => dirtyPermissions.includes(p.id));
                  return (
                    <div key={module} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-700 dark:bg-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{module.toUpperCase()}</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs text-slate-500 font-medium">Select All</span>
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => toggleModule(items, e.target.checked)}
                            disabled={selectedRole.isSystemRole}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </label>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {items.map((permission) => (
                          <label key={permission.id} className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedRole.isSystemRole ? "opacity-70" : ""}`}>
                            <div className="flex h-5 items-center mt-0.5">
                              <input
                                type="checkbox"
                                checked={dirtyPermissions.includes(permission.id)}
                                onChange={(e) => togglePermission(permission.id, e.target.checked)}
                                disabled={selectedRole.isSystemRole}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                            </div>
                            <div className="min-w-0 flex-1 text-sm">
                              <div className="font-medium text-slate-900 dark:text-slate-100">{permission.name}</div>
                              {permission.description && (
                                <div className="mt-1 text-xs text-slate-500 leading-relaxed">{permission.description}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
