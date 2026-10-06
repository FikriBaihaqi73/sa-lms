import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ProfileRepository } from "@repo/shared/infrastructure/repository/profile.repository";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { ROLES_KEY } from "./roles.decorator";

interface RoleAwareUser {
  sub?: unknown;
  role?: unknown;
  roles?: unknown;
}

interface RoleAwareRequest extends Request {
  user?: RoleAwareUser;
}

function normalizeRole(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function extractRolesFromUser(user: RoleAwareUser | undefined): string[] {
  if (!user) return [];
  const collected: string[] = [];
  const single = normalizeRole(user.role);
  if (single) collected.push(single);
  if (Array.isArray(user.roles)) {
    for (const entry of user.roles) {
      const normalized = normalizeRole(entry);
      if (normalized) collected.push(normalized);
    }
  }
  return collected;
}

/**
 * Global role guard. Runs after JwtAuthGuard: endpoints without
 * @Roles() stay open, endpoints with @Roles() require one of the
 * listed roles (case-insensitive). Falls back to Profile lookup
 * when the JWT does not carry a role claim.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly profileRepository: ProfileRepository;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    this.profileRepository = new ProfileRepository(this.prisma.client);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RoleAwareRequest>();
    const rolesFromToken = extractRolesFromUser(request.user);

    if (rolesFromToken.length > 0) {
      if (requiredRoles.some((role) => rolesFromToken.includes(role))) {
        return true;
      }
      throw new ForbiddenException("Insufficient role");
    }

    const userId =
      typeof request.user?.sub === "string" ? request.user.sub : null;
    if (!userId) {
      throw new ForbiddenException("Insufficient role");
    }

    const profile = await this.profileRepository.findByUserId(userId);
    const profileRole = normalizeRole(profile?.role?.name);
    if (profileRole && requiredRoles.includes(profileRole)) {
      return true;
    }

    throw new ForbiddenException("Insufficient role");
  }
}
