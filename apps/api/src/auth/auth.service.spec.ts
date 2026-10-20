import {
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthRepository } from "@repo/shared/infrastructure/repository/auth.repository";
import type { RegisterDto } from "@repo/shared/schemas/auth.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));
jest.mock("@nestjs/jwt", () => ({ JwtService: class JwtService {} }));

describe("AuthService logout", () => {
  const accessToken = "valid-access-token";
  let jwtService: jest.Mocked<Pick<JwtService, "verifyAsync">>;
  let service: AuthService;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    service = new AuthService(
      {} as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it("rejects a request without a Bearer token", async () => {
    await expect(service.logout()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("rejects an invalid or expired token", async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error("expired"));

    await expect(
      service.logout(`Bearer ${accessToken}`),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("revokes a verified token that belongs to an active user", async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: "user-id" });
    jest
      .spyOn(AuthRepository.prototype, "findActiveUserByAccessToken")
      .mockResolvedValue({ id: "user-id" } as never);
    const clearAccessToken = jest
      .spyOn(AuthRepository.prototype, "clearAccessToken")
      .mockResolvedValue({ id: "user-id" } as never);

    await expect(service.logout(`Bearer ${accessToken}`)).resolves.toEqual({
      success: true,
    });
    expect(clearAccessToken).toHaveBeenCalledWith("user-id");
  });
});

describe("AuthService register", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService({} as PrismaService, {} as JwtService);
  });

  afterEach(() => jest.restoreAllMocks());

  const baseDto = {
    email: "New@Example.com",
    password: "secret123",
    role: "student",
  } as RegisterDto;

  it("registers a student under the institution that owns a valid referral", async () => {
    const created = { id: "user-id", email: "new@example.com" };
    const findByEmail = jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    jest
      .spyOn(AuthRepository.prototype, "findValidReferralInstitution")
      .mockResolvedValue({ institutionId: "institution-id" });
    jest
      .spyOn(AuthRepository.prototype, "findDefaultRole")
      .mockResolvedValue({ id: "student-role-id" } as never);
    const registerStudent = jest
      .spyOn(AuthRepository.prototype, "registerStudent")
      .mockResolvedValue(created as never);

    const result = await service.register({
      ...baseDto,
      referralCode: "SCH-2026",
    });

    expect(result).toEqual(created);
    expect(findByEmail).toHaveBeenCalledWith("new@example.com");
    expect(registerStudent).toHaveBeenCalledWith(
      { email: "new@example.com", password: expect.any(String) },
      "institution-id",
      "student-role-id",
    );
  });

  it("rejects a missing, invalid, or expired student referral", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    jest
      .spyOn(AuthRepository.prototype, "findValidReferralInstitution")
      .mockResolvedValue(null);
    const registerStudent = jest.spyOn(AuthRepository.prototype, "registerStudent");

    await expect(
      service.register({ ...baseDto, referralCode: "EXPIRED" }),
    ).rejects.toMatchObject({
      message: "Kode referral tidak ditemukan atau sudah kadaluwarsa",
    });
    expect(registerStudent).not.toHaveBeenCalled();
  });

  it("registers an institution owner and attaches it to the default admin role", async () => {
    const created = { id: "user-id", email: "new@example.com" };
    const findByEmail = jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    const findRole = jest
      .spyOn(AuthRepository.prototype, "findDefaultRole")
      .mockResolvedValue({ id: "role-id" } as never);
    const registerInstitutionOwner = jest
      .spyOn(AuthRepository.prototype, "registerInstitutionOwner")
      .mockResolvedValue(created as never);

    const result = await service.register({
      ...baseDto,
      role: "instansi",
      institutionName: "Example Academy",
    } as RegisterDto);

    expect(result).toEqual(created);
    expect(findByEmail).toHaveBeenCalledWith("new@example.com");
    expect(findRole).toHaveBeenCalledWith("admin");
    expect(registerInstitutionOwner).toHaveBeenCalledWith(
      { email: "new@example.com", password: expect.any(String) },
      "Example Academy",
      "role-id",
    );
  });

  it("rejects a superadmin role through public registration", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    const registerSuperAdmin = jest.spyOn(
      AuthRepository.prototype,
      "registerSuperAdmin",
    );

    await expect(
      service.register({ ...baseDto, role: "superadmin" } as never),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(registerSuperAdmin).not.toHaveBeenCalled();
  });

  it("rejects a teacher role through public registration (0208)", async () => {
    // Teacher accounts must only be created by an admin via POST /profiles
    // (teacher roleId) + POST /teachers. Public self-registration for the
    // teacher role is disabled at both the Zod schema and service layers.
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    const createUser = jest.spyOn(AuthRepository.prototype, "createUser");
    const findRole = jest.spyOn(AuthRepository.prototype, "findDefaultRole");
    const registerInstitutionOwner = jest.spyOn(
      AuthRepository.prototype,
      "registerInstitutionOwner",
    );

    await expect(
      service.register({ ...baseDto, role: "teacher" } as never),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(createUser).not.toHaveBeenCalled();
    expect(findRole).not.toHaveBeenCalled();
    expect(registerInstitutionOwner).not.toHaveBeenCalled();
  });

  it("rejects a guardian role through public registration (0208)", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    const createUser = jest.spyOn(AuthRepository.prototype, "createUser");

    await expect(
      service.register({ ...baseDto, role: "guardian" } as never),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email before creating anything", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue({ id: "existing-user" } as never);
    const registerSuperAdmin = jest.spyOn(
      AuthRepository.prototype,
      "registerSuperAdmin",
    );

    await expect(service.register(baseDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(registerSuperAdmin).not.toHaveBeenCalled();
  });

  const instansiDto = {
    ...baseDto,
    role: "instansi",
    institutionName: "Example Academy",
  } as RegisterDto;

  it("returns 503 when the default admin role is missing from the database", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    jest
      .spyOn(AuthRepository.prototype, "findDefaultRole")
      .mockResolvedValue(null);

    await expect(service.register(instansiDto)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it("rejects an unknown registration role", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);

    await expect(
      service.register({ ...baseDto, role: "hacker" } as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("propagates unique-constraint errors from the transaction as 409", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    jest
      .spyOn(AuthRepository.prototype, "findDefaultRole")
      .mockResolvedValue({ id: "role-id" } as never);
    jest
      .spyOn(AuthRepository.prototype, "registerInstitutionOwner")
      .mockRejectedValue({ code: "P2002" });

    await expect(service.register(instansiDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

describe("AuthService login", () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  let service: AuthService;
  let jwtService: jest.Mocked<Pick<JwtService, "signAsync">>;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret";
    jwtService = { signAsync: jest.fn().mockResolvedValue("access-token") };
    service = new AuthService(
      {} as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    jest.restoreAllMocks();
  });

  it("returns 401 instead of a server error for an unknown email", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findLoginUser")
      .mockResolvedValue(null);

    await expect(
      service.login({ email: "missing@example.com", password: "password123" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns 503 when JWT configuration is missing after valid credentials", async () => {
    delete process.env.JWT_SECRET;
    jest.spyOn(AuthRepository.prototype, "findLoginUser").mockResolvedValue({
      id: "user-id",
      email: "admin@example.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      is_active: true,
    } as never);
    const authService = service as unknown as {
      verifyPassword(password: string, hash: string): Promise<boolean>;
    };
    jest.spyOn(authService, "verifyPassword").mockResolvedValue(true);

    await expect(
      service.login({ email: "admin@example.com", password: "password" }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
