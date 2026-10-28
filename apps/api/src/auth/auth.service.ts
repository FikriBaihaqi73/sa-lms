import {
  ConflictException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthRepository } from "@repo/shared/infrastructure/repository/auth.repository";
import { ProfileRepository } from "@repo/shared/infrastructure/repository/profile.repository";
import type { LoginDto, RegisterDto } from "@repo/shared/schemas/auth.schema";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

interface AccessTokenPayload {
  sub?: unknown;
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

@Injectable()
export class AuthService {
  private readonly authRepository: AuthRepository;
  private readonly profileRepository: ProfileRepository;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.authRepository = new AuthRepository(this.prisma.client);
    this.profileRepository = new ProfileRepository(this.prisma.client);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const userByEmail = await this.authRepository.findUserByEmail(email);

    if (userByEmail) {
      throw new ConflictException(
        "Registration could not be completed (email in use)",
      );
    }

    const password = await this.hashPassword(dto.password);

    try {
      if (dto.role === "student") {
        const referral = await this.authRepository.findValidReferralInstitution(
          dto.referralCode as string,
        );
        if (!referral) {
          throw new ConflictException(
            "Kode referral tidak ditemukan atau sudah kadaluwarsa",
          );
        }

        const role = await this.authRepository.findDefaultRole("student");
        if (!role) {
          throw new ServiceUnavailableException(
            "Registration is temporarily unavailable (missing default student role)",
          );
        }

        return await this.authRepository.registerStudent(
          { email, password },
          referral,
          role.id,
        );
      } else if (dto.role === "instansi") {
        const roleName = process.env.DEFAULT_INSTITUTION_ADMIN_ROLE ?? "admin";
        const role = await this.authRepository.findDefaultRole(roleName);
        if (!role) {
          throw new ServiceUnavailableException(
            "Registration is temporarily unavailable (missing default admin role)",
          );
        }

        return await this.authRepository.registerInstitutionOwner(
          { email, password },
          dto.institutionName as string,
          role.id,
        );
      }
      // NOTE: superadmin accounts are provisioned via seed scripts only
      // (seed-users.ts). Public registration for that role is disabled.
      throw new ConflictException("Invalid registration role");
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException("Registration could not be completed");
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      const email = dto.email.toLowerCase();
      const user = await this.authRepository.findLoginUser(email);
      if (
        !user ||
        !user.is_active ||
        !(await this.verifyPassword(dto.password, user.password))
      ) {
        throw new UnauthorizedException("Email atau kata sandi salah");
      }

      if (!process.env.JWT_SECRET?.trim()) {
        console.error("Login configuration error: JWT_SECRET is not configured");
        throw new ServiceUnavailableException(
          "Layanan login sementara tidak tersedia. Silakan hubungi administrator.",
        );
      }

      await this.authRepository.updateLastLogin(user.id);

      const profile = await this.profileRepository.findByUserId(user.id);
      const role = profile?.role?.name?.trim().toLowerCase() ?? null;

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        ...(role ? { role } : {}),
      });
      const updatedUser = await this.authRepository.updateAccessToken(
        user.id,
        accessToken,
      );

      return {
        accessToken,
        tokenType: "Bearer",
        expiresIn: 900,
        user: {
          ...updatedUser,
          ...(role
            ? {
                activeRole: role,
                activeInstitutionId: profile?.institutionId ?? null,
                activeProfileId: profile?.id ?? null,
              }
            : {}),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error("Login failed due to an unexpected infrastructure error", error);
      throw new ServiceUnavailableException(
        "Layanan login sementara tidak tersedia. Silakan coba lagi.",
      );
    }
  }

  async logout(authorization?: string) {
    const accessToken = this.extractAccessToken(authorization);
    let payload: AccessTokenPayload;
    try {
      payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken);
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }

    if (typeof payload.sub !== "string") {
      throw new UnauthorizedException("Invalid access token");
    }

    const user = await this.authRepository.findActiveUserByAccessToken(
      payload.sub,
      accessToken,
    );
    if (!user) {
      throw new UnauthorizedException("Invalid access token");
    }

    await this.authRepository.clearAccessToken(user.id);
    return { success: true };
  }

  private extractAccessToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException("Invalid access token");
    }

    const [scheme, accessToken, ...remaining] = authorization.split(" ");
    if (
      !scheme ||
      scheme.toLowerCase() !== "bearer" ||
      !accessToken ||
      remaining.length > 0
    ) {
      throw new UnauthorizedException("Invalid access token");
    }
    return accessToken;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error("Password hash comparison failed", error);
      return false;
    }
  }
}
