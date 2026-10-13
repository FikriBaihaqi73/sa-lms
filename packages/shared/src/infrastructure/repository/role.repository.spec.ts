import type { PrismaClient } from "#generated/client";
import { RoleRepository } from "./role.repository";

describe("RoleRepository", () => {
  const role = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const prisma = {
    role,
  } as unknown as PrismaClient;

  const repository = new RoleRepository(prisma);

  const sampleRole = {
    id: "role-uuid-1",
    name: "Teacher",
    description: "Teacher role",
    createdAt: new Date(),
    updatedAt: new Date(),
    rolePermissions: [
      {
        id: "rp-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        roleId: "role-uuid-1",
        permissionId: "perm-uuid-1",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a role with name and description without permissions", async () => {
      role.create.mockResolvedValue(sampleRole);

      const result = await repository.create({
        name: "Teacher",
        description: "Teacher role",
      });

      expect(result).toEqual(sampleRole);
      expect(role.create).toHaveBeenCalledWith({
        data: {
          name: "Teacher",
          description: "Teacher role",
        },
        select: expect.any(Object),
      });
    });

    it("creates a role with permission IDs connecting relations", async () => {
      role.create.mockResolvedValue(sampleRole);

      const result = await repository.create({
        name: "Admin",
        description: "Administrator",
        permissionIds: ["perm-uuid-1", "perm-uuid-2"],
      });

      expect(result).toEqual(sampleRole);
      expect(role.create).toHaveBeenCalledWith({
        data: {
          name: "Admin",
          description: "Administrator",
          rolePermissions: {
            create: [
              { permission: { connect: { id: "perm-uuid-1" } } },
              { permission: { connect: { id: "perm-uuid-2" } } },
            ],
          },
        },
        select: expect.any(Object),
      });
    });

    it("defaults description to null when omitted", async () => {
      role.create.mockResolvedValue({ ...sampleRole, description: null });

      const result = await repository.create({
        name: "Student",
      });

      expect(result.description).toBeNull();
      expect(role.create).toHaveBeenCalledWith({
        data: {
          name: "Student",
          description: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("findById", () => {
    it("finds role by id where deletedAt is null", async () => {
      role.findFirst.mockResolvedValue(sampleRole);

      const result = await repository.findById("role-uuid-1");
      expect(result).toEqual(sampleRole);
      expect(role.findFirst).toHaveBeenCalledWith({
        where: {
          id: "role-uuid-1",
          deletedAt: null,
        },
        select: expect.any(Object),
      });
    });

    it("returns null if role is not found", async () => {
      role.findFirst.mockResolvedValue(null);

      const result = await repository.findById("missing-uuid");
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("finds role by name where deletedAt is null", async () => {
      role.findFirst.mockResolvedValue(sampleRole);

      const result = await repository.findByName("Teacher");
      expect(result).toEqual(sampleRole);
      expect(role.findFirst).toHaveBeenCalledWith({
        where: {
          name: "Teacher",
          deletedAt: null,
        },
        select: expect.any(Object),
      });
    });

    it("returns null if role name does not exist", async () => {
      role.findFirst.mockResolvedValue(null);

      const result = await repository.findByName("NonExistent");
      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("returns paginated data and calculates metadata", async () => {
      role.findMany.mockResolvedValue([sampleRole]);
      role.count.mockResolvedValue(15);

      const result = await repository.findAll(2, 10);

      expect(result.data).toEqual([sampleRole]);
      expect(result.meta).toEqual({
        totalData: 15,
        totalPages: 2,
        currentPage: 2,
        perPage: 10,
      });
      expect(role.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 10,
        take: 10,
        select: expect.any(Object),
        orderBy: { createdAt: "desc" },
      });
      expect(role.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });
  });

  describe("update", () => {
    it("updates name and description", async () => {
      const updated = { ...sampleRole, name: "Lead Teacher" };
      role.update.mockResolvedValue(updated);

      const result = await repository.update("role-uuid-1", {
        name: "Lead Teacher",
        description: "Updated description",
      });

      expect(result).toEqual(updated);
      expect(role.update).toHaveBeenCalledWith({
        where: { id: "role-uuid-1" },
        data: {
          name: "Lead Teacher",
          description: "Updated description",
        },
        select: expect.any(Object),
      });
    });

    it("updates permissionIds by clearing existing and connecting new", async () => {
      role.update.mockResolvedValue(sampleRole);

      const result = await repository.update("role-uuid-1", {
        permissionIds: ["perm-uuid-3"],
      });

      expect(result).toEqual(sampleRole);
      expect(role.update).toHaveBeenCalledWith({
        where: { id: "role-uuid-1" },
        data: {
          rolePermissions: {
            deleteMany: {},
            create: [{ permission: { connect: { id: "perm-uuid-3" } } }],
          },
        },
        select: expect.any(Object),
      });
    });
  });

  describe("delete", () => {
    it("soft deletes by setting deletedAt timestamp", async () => {
      role.update.mockResolvedValue(sampleRole);

      const result = await repository.delete("role-uuid-1");
      expect(result).toEqual(sampleRole);
      expect(role.update).toHaveBeenCalledWith({
        where: { id: "role-uuid-1" },
        data: {
          deletedAt: expect.any(Date),
        },
        select: expect.any(Object),
      });
    });
  });
});
