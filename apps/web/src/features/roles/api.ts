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

const LOCAL_ROLES_KEY = "mock_roles_data_v1";

const DEFAULT_MOCK_ROLES: Role[] = [];

function getMockRoles(): Role[] {
  if (typeof window === "undefined") return DEFAULT_MOCK_ROLES;
  const stored = localStorage.getItem(LOCAL_ROLES_KEY);
  if (!stored) {
    return DEFAULT_MOCK_ROLES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_MOCK_ROLES;
  }
}

function setMockRoles(roles: Role[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_ROLES_KEY, JSON.stringify(roles));
  }
}

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
  try {
    const response = (await apiFetch("/permissions")) as ApiEnvelope<ApiPermission[]>;
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      return [
        { id: "p1", name: "Manage Users", module: "Users" },
        { id: "p2", name: "Manage Roles", module: "Roles" },
        { id: "p3", name: "View Reports", module: "Reports" },
      ];
    }
    throw error;
  }
}

export async function getRoles(totalPermissions: number): Promise<Role[]> {
  try {
    const response = (await apiFetch(rolesKey)) as ApiEnvelope<ApiRole[]>;
    const apiRoles = response.data.map((role) => toRole(role, totalPermissions));
    const localRoles = getMockRoles().filter(
      (mock) => !apiRoles.some((api) => api.name.toLowerCase() === mock.name.toLowerCase()),
    );
    return [...apiRoles, ...localRoles];
  } catch (error) {
    if (import.meta.env.DEV) {
      return getMockRoles();
    }
    throw error;
  }
}

type RoleRequest = Pick<RoleFormValues, "name" | "description" | "permissionIds">;

function toRoleRequest(values: RoleFormValues): RoleRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    permissionIds: values.permissionIds,
  };
}

export async function createRole(values: RoleFormValues): Promise<void> {
  try {
    await apiFetch("/roles", {
      method: "POST",
      body: JSON.stringify(toRoleRequest(values)),
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      const currentRoles = getMockRoles();
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: values.name.trim(),
        roleSlug: `role_${values.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_")}`,
        description: values.description.trim(),
        permissionCount: values.permissionIds?.length ?? 0,
        totalPermissions: 12,
        userCount: 0,
        isSystemRole: false,
        permissionIds: values.permissionIds ?? [],
      };
      setMockRoles([newRole, ...currentRoles]);
      return;
    }
    throw error;
  }
}

export async function updateRole(id: string, values: RoleFormValues): Promise<void> {
  try {
    await apiFetch(`/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toRoleRequest(values)),
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      const currentRoles = getMockRoles();
      const updatedRoles = currentRoles.map((r) =>
        r.id === id
          ? {
              ...r,
              name: values.name.trim(),
              description: values.description.trim(),
              permissionIds: values.permissionIds ?? r.permissionIds,
              permissionCount: values.permissionIds?.length ?? r.permissionCount,
            }
          : r,
      );
      setMockRoles(updatedRoles);
      return;
    }
    throw error;
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    await apiFetch(`/roles/${id}`, { method: "DELETE" });
  } catch (error) {
    if (import.meta.env.DEV) {
      const currentRoles = getMockRoles();
      setMockRoles(currentRoles.filter((r) => r.id !== id));
      return;
    }
    throw error;
  }
}
