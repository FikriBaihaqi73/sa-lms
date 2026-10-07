import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/**
 * Restrict an endpoint to specific role names (case-insensitive).
 * When no roles are attached, the RolesGuard allows the request
 * so existing controllers keep working until they opt in.
 */
export const Roles = (...roles: string[]) =>
  SetMetadata(
    ROLES_KEY,
    roles.map((role) => role.toLowerCase()),
  );
