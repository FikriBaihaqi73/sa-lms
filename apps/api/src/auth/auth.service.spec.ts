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
    role: "superadmin",
  } as RegisterDto;

  it("registers a superadmin and attaches it to the superadmin role", async () => {
    const created = { id: "user-id", email: "new@example.com" };
    const findByEmail = jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    const findRole = jest
      .spyOn(AuthRepository.prototype, "findDefaultRole")
      .mockResolvedValue({ id: "role-id" } as never);
    const registerSuperAdmin = jest
      .spyOn(AuthRepository.prototype, "registerSuperAdmin")
      .mockResolvedValue(created as never);

    const result = await service.register(baseDto);

    expect(result).toEqual(created);
    expect(findByEmail).toHaveBeenCalledWith("new@example.com");
    expect(findRole).toHaveBeenCalledWith("superadmin");
    expect(registerSuperAdmin).toHaveBeenCalledWith(
      { email: "new@example.com", password: expect.any(String) },
      "role-id",
    );
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

  it("returns 503 when the superadmin role is missing from the database", async () => {
    jest
      .spyOn(AuthRepository.prototype, "findUserByEmail")
      .mockResolvedValue(null);
    jest
      .spyOn(AuthRepository.prototype, "findDefaultRole")
      .mockResolvedValue(null);

    await expect(service.register(baseDto)).rejects.toBeInstanceOf(
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
      .spyOn(AuthRepository.prototype, "registerSuperAdmin")
      .mockRejectedValue({ code: "P2002" });

    await expect(service.register(baseDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
