import { ForbiddenException } from "@nestjs/common";
import { ProfileRepository } from "@repo/shared/infrastructure/repository/profile.repository";
import { ROLES_KEY } from "../auth/roles.decorator";
import type { PrismaService } from "../prisma/prisma.service";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("student profile options", () => {
  const findFirst = jest.fn();
  const findMany = jest.fn();
  const count = jest.fn();
  const prisma = {
    client: { profile: { findFirst, findMany, count } },
  } as unknown as PrismaService;
  let service: ProfileService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProfileService(prisma);
  });

  it("restricts the route to admin", () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        ProfileController.prototype.studentOptions,
      ),
    ).toEqual(["admin"]);
  });

  it("rejects a user without an institution", async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.studentOptions("user")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it("applies institution, unlinked profile, search and pagination in database queries", async () => {
    findFirst.mockResolvedValue({ institutionId: "institution-a" });
    findMany.mockResolvedValue([{ id: "a", fullName: "A", email: null }]);
    count.mockResolvedValue(41);
    const result = await service.studentOptions("user", 2, 20, "alice");
    const where = {
      institutionId: "institution-a",
      deletedAt: null,
      student: { is: null },
      OR: [
        { fullName: { contains: "alice", mode: "insensitive" } },
        { email: { contains: "alice", mode: "insensitive" } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where, skip: 20, take: 20 }),
    );
    expect(count).toHaveBeenCalledWith({ where });
    expect(result.meta).toEqual({
      page: 2,
      limit: 20,
      total: 41,
      totalPages: 3,
    });
    expect(ProfileRepository).toBeDefined();
  });
});

describe("teacher profile options", () => {
  const findFirst = jest.fn();
  const findMany = jest.fn();
  const count = jest.fn();
  const prisma = {
    client: { profile: { findFirst, findMany, count } },
  } as unknown as PrismaService;
  let service: ProfileService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProfileService(prisma);
  });

  it("restricts the route to admin", () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        ProfileController.prototype.teacherOptions,
      ),
    ).toEqual(["admin"]);
  });

  it("rejects a user without an institution", async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.teacherOptions("user")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it("applies institution, unlinked teacher profile, search and pagination in database queries", async () => {
    findFirst.mockResolvedValue({ institutionId: "institution-a" });
    findMany.mockResolvedValue([
      { id: "t1", fullName: "Teacher 1", email: null },
    ]);
    count.mockResolvedValue(15);
    const result = await service.teacherOptions("user", 1, 10, "teacher");
    const where = {
      institutionId: "institution-a",
      deletedAt: null,
      teacher: { is: null },
      OR: [
        { fullName: { contains: "teacher", mode: "insensitive" } },
        { email: { contains: "teacher", mode: "insensitive" } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where, skip: 0, take: 10 }),
    );
    expect(count).toHaveBeenCalledWith({ where });
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
    });
  });
});
