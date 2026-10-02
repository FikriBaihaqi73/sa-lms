export interface Role {
  id: string;
  name: string;
  roleSlug: string;
  description: string | null;
  permissionCount: number;
  totalPermissions: number;
  userCount: number;
  isSystemRole: boolean;
  permissionIds: string[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
}

export interface RoleFormValues {
  name: string;
  description: string;
  permissionIds?: string[];
}

export type RoleTypeFilter = "all" | "system" | "custom";

interface ApiRolePermission {
  permissionId: string;
}

export interface ApiRole {
  id: string;
  name: string;
  description: string | null;
  rolePermissions?: ApiRolePermission[];
}

export interface ApiPermission extends Permission {
  description?: string | null;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: { totalData?: number };
  message?: string;
}
