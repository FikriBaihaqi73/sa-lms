import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { ProfileRepository } from "@repo/shared/infrastructure/repository/profile.repository";
import type { PrismaService } from "../prisma/prisma.service";
import { RolesGuard } from "./roles.guard";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("RolesGuard", () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector, {} as PrismaService);

  const createContext = (user?: unknown): ExecutionContext => {
    const request = { user };
    return {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows endpoints without role metadata", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
  });

  it("allows a matching role from the JWT claim", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);

    await expect(
      guard.canActivate(createContext({ sub: "user-id", role: "Admin" })),
    ).resolves.toBe(true);
  });

  it("rejects a non-matching JWT role", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);

    await expect(
      guard.canActivate(createContext({ sub: "user-id", role: "student" })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("falls back to the profile role when the JWT has no role claim", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
    jest
      .spyOn(ProfileRepository.prototype, "findByUserId")
      .mockResolvedValue({ role: { name: "Admin" } } as never);

    await expect(
      guard.canActivate(createContext({ sub: "user-id" })),
    ).resolves.toBe(true);
  });

  it("rejects when neither token nor profile has the required role", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
    jest
      .spyOn(ProfileRepository.prototype, "findByUserId")
      .mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ sub: "user-id" })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows every operational role when superadmin is excluded from @Roles", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValue(["admin", "teacher", "student", "guardian"]);

    await expect(
      guard.canActivate(createContext({ sub: "u1", role: "admin" })),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(createContext({ sub: "u2", role: "teacher" })),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(createContext({ sub: "u3", role: "student" })),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(createContext({ sub: "u4", role: "guardian" })),
    ).resolves.toBe(true);
  });

  it("rejects superadmin when it is not listed in @Roles", async () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValue(["admin", "teacher", "student", "guardian"]);

    await expect(
      guard.canActivate(createContext({ sub: "u5", role: "superadmin" })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
