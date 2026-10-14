import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRepository } from "@repo/shared/infrastructure/repository/user.repository";
import type {
  CreateUserDto,
  UpdateUserDto,
} from "@repo/shared/schemas/user.schema";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Role name that is allowed to operate across every institution. Matches the
 * role seeded by `seed-roles.ts` / `seed-users.ts`.
 */
const SUPERADMIN_ROLE = "superadmin";

interface CallerScope {
  role: string | null;
  institutionId: string | null;
}

@Injectable()
export class UserService {
  private readonly userRepository: UserRepository;

  constructor(private readonly prisma: PrismaService) {
    this.userRepository = new UserRepository(this.prisma.client);
  }

  /**
   * Resolve the authenticated caller's role and institution from their trusted
   * profile in the database. The role/institution are never read from the
   * request body or query, so a caller cannot read or mutate another
   * institution's users by tampering with the request.
   */
  private async resolveCallerScope(userId: string): Promise<CallerScope> {
    const profile = await this.prisma.client.profile.findFirst({
      where: { userId, deletedAt: null },
      select: { institutionId: true, role: { select: { name: true } } },
    });
    if (!profile) {
      throw new ForbiddenException("Institution access is required");
    }
    return {
      role: profile.role?.name?.trim().toLowerCase() ?? null,
      institutionId: profile.institutionId,
    };
  }

  /**
   * Institution filter applied to user queries. Superadmin may access every
   * institution (returns `undefined`, i.e. no filter). Every other role is
   * limited to the institution that owns their profile.
   */
  private async institutionScopeFor(
    userId: string,
  ): Promise<string | undefined> {
    const { role, institutionId } = await this.resolveCallerScope(userId);
    if (role === SUPERADMIN_ROLE) {
      return undefined;
    }
    return institutionId ?? undefined;
  }

  async findAll(
    page = 1,
    limit = 10,
    search: string | undefined,
    userId: string,
  ) {
    const institutionId = await this.institutionScopeFor(userId);
    return this.userRepository.findAll({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(institutionId !== undefined ? { institution_id: institutionId } : {}),
    });
  }

  async findOne(id: string, userId: string) {
    const institutionId = await this.institutionScopeFor(userId);
    const user = await this.userRepository.findById(id, institutionId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async create(dto: CreateUserDto, userId: string) {
    // Ensure the caller is a legitimate institution-bound actor (superadmin or
    // institution admin). No role or institution is taken from the request, so
    // a new user can never be granted superadmin rights or attached to another
    // institution through this endpoint.
    await this.resolveCallerScope(userId);

    const email = dto.email.toLowerCase();
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException("User email already exists");
    }

    return this.userRepository.create({
      email,
      password: await this.hashPassword(dto.password),
      ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
    });
  }

  async update(id: string, dto: UpdateUserDto, userId: string) {
    await this.findOne(id, userId);

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase();
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== id) {
        throw new ConflictException("User email already in use");
      }
    }

    return this.userRepository.update(id, {
      ...(dto.email !== undefined ? { email: dto.email.toLowerCase() } : {}),
      ...(dto.password !== undefined
        ? { password: await this.hashPassword(dto.password) }
        : {}),
      ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.userRepository.delete(id);
    return { success: true, id };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
