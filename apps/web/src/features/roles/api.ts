import { apiFetch } from "@/lib/api";
import type {
  ApiEnvelope,
  ApiPermission,
  ApiRole,
  Permission,
  Role,
  RoleFormValues,
} from "./types";

const rolesKey = "/roles?limit=100";

function toRole(role: ApiRole, totalPermissions: number): Role {
  const permissionIds = role.rolePermissions?.map(({ permissionId }) => permissionId) ?? [];

  return {
    id: role.id,
    name: role.name,
    roleSlug: `role_${role.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_")}`,
    description: role.description,
    permissionCount: permissionIds.length,
    totalPermissions,
    userCount: 0,
    isSystemRole: false,
    permissionIds,
  };
}

export async function getPermissions(): Promise<Permission[]> {
  const response = (await apiFetch("/permissions")) as ApiEnvelope<ApiPermission[]>;
  return response.data;
}

export async function getRoles(totalPermissions: number): Promise<Role[]> {
  const response = (await apiFetch(rolesKey)) as ApiEnvelope<ApiRole[]>;
  return response.data.map((role) => toRole(role, totalPermissions));
}

type RoleRequest = Pick<RoleFormValues, "name" | "description">;

function toRoleRequest(values: RoleFormValues): RoleRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
  };
}

export async function createRole(values: RoleFormValues): Promise<void> {
  // TODO: The current backend CreateRoleDto does not accept permissionIds.
  // Keep this boundary explicit until a role-permissions assignment endpoint is added.
  await apiFetch("/roles", {
    method: "POST",
    body: JSON.stringify(toRoleRequest(values)),
  });
}

export async function updateRole(id: string, values: RoleFormValues): Promise<void> {
  // TODO: The backend exposes PATCH and does not yet persist permissionIds.
  await apiFetch(`/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toRoleRequest(values)),
  });
}

export async function deleteRole(id: string): Promise<void> {
  await apiFetch(`/roles/${id}`, { method: "DELETE" });
}
