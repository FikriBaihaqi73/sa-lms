import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { RoleRepository } from "@repo/shared/infrastructure/repository/role.repository";
import type {
  CreateRoleDto,
  UpdateRoleDto,
} from "@repo/shared/schemas/role.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { RoleService } from "./role.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {
      role: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      permission: {
        findMany: jest.fn(),
      },
    };
  },
}));

describe("RoleService", () => {
  let service: RoleService;
  let mockPrismaService: {
    client: {
      role: {
        findFirst: jest.Mock;
        findMany: jest.Mock;
        count: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
      };
      permission: {
        findMany: jest.Mock;
      };
    };
  };

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
    mockPrismaService = {
      client: {
        role: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        permission: {
          findMany: jest.fn(),
        },
      },
    };
    service = new RoleService(mockPrismaService as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findAll", () => {
    it("returns paginated roles from repository", async () => {
      const mockResult = {
        data: [sampleRole],
        meta: {
          totalData: 1,
          totalPages: 1,
          currentPage: 1,
          perPage: 10,
        },
      };
      jest
        .spyOn(RoleRepository.prototype, "findAll")
        .mockResolvedValue(mockResult);

      const result = await service.findAll(1, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe("findOne", () => {
    it("returns role if found", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findById")
        .mockResolvedValue(sampleRole);

      const result = await service.findOne("role-uuid-1");
      expect(result).toEqual(sampleRole);
    });

    it("throws NotFoundException if role does not exist", async () => {
      jest.spyOn(RoleRepository.prototype, "findById").mockResolvedValue(null);

      await expect(service.findOne("missing-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("creates a role successfully with valid data", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findByName")
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(RoleRepository.prototype, "create")
        .mockResolvedValue(sampleRole);

      const dto: CreateRoleDto = {
        name: "  Teacher  ",
        description: "  Teacher role  ",
        permissionIds: [],
      };

      const result = await service.create(dto);
      expect(result).toEqual(sampleRole);
      expect(createSpy).toHaveBeenCalledWith({
        name: "Teacher",
        description: "Teacher role",
        permissionIds: [],
      });
    });

    it("creates a role with validated permission IDs", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findByName")
        .mockResolvedValue(null);
      mockPrismaService.client.permission.findMany.mockResolvedValue([
        { id: "perm-uuid-1" },
        { id: "perm-uuid-2" },
      ]);
      const createSpy = jest
        .spyOn(RoleRepository.prototype, "create")
        .mockResolvedValue(sampleRole);

      const dto: CreateRoleDto = {
        name: "Supervisor",
        description: "Supervisor role",
        permissionIds: ["perm-uuid-1", "perm-uuid-2"],
      };

      const result = await service.create(dto);
      expect(result).toEqual(sampleRole);
      expect(mockPrismaService.client.permission.findMany).toHaveBeenCalledWith(
        {
          where: {
            id: { in: ["perm-uuid-1", "perm-uuid-2"] },
            deletedAt: null,
          },
          select: { id: true },
        },
      );
      expect(createSpy).toHaveBeenCalledWith({
        name: "Supervisor",
        description: "Supervisor role",
        permissionIds: ["perm-uuid-1", "perm-uuid-2"],
      });
    });

    it("throws ConflictException if role name already exists", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findByName")
        .mockResolvedValue(sampleRole);

      const dto: CreateRoleDto = {
        name: "Teacher",
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it("throws BadRequestException if any permission ID is invalid", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findByName")
        .mockResolvedValue(null);
      mockPrismaService.client.permission.findMany.mockResolvedValue([
        { id: "perm-uuid-1" },
      ]);

      const dto: CreateRoleDto = {
        name: "Supervisor",
        permissionIds: ["perm-uuid-1", "invalid-perm-id"],
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("update", () => {
    it("updates role successfully", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findById")
        .mockResolvedValue(sampleRole);
      jest
        .spyOn(RoleRepository.prototype, "findByName")
        .mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(RoleRepository.prototype, "update")
        .mockResolvedValue(sampleRole);

      const dto: UpdateRoleDto = {
        name: "  Head Teacher  ",
        description: "  Updated description  ",
      };

      const result = await service.update("role-uuid-1", dto);
      expect(result).toEqual(sampleRole);
      expect(updateSpy).toHaveBeenCalledWith("role-uuid-1", {
        name: "Head Teacher",
        description: "Updated description",
      });
    });

    it("throws ConflictException if updated name belongs to another role", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findById")
        .mockResolvedValue(sampleRole);
      jest.spyOn(RoleRepository.prototype, "findByName").mockResolvedValue({
        ...sampleRole,
        id: "another-role-id",
        name: "Admin",
      });

      const dto: UpdateRoleDto = {
        name: "Admin",
      };

      await expect(service.update("role-uuid-1", dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("allows updating when name belongs to current role", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findById")
        .mockResolvedValue(sampleRole);
      jest
        .spyOn(RoleRepository.prototype, "findByName")
        .mockResolvedValue(sampleRole);
      const updateSpy = jest
        .spyOn(RoleRepository.prototype, "update")
        .mockResolvedValue(sampleRole);

      const dto: UpdateRoleDto = {
        name: "Teacher",
        description: "Same name new desc",
      };

      const result = await service.update("role-uuid-1", dto);
      expect(result).toEqual(sampleRole);
      expect(updateSpy).toHaveBeenCalledWith("role-uuid-1", {
        name: "Teacher",
        description: "Same name new desc",
      });
    });

    it("throws BadRequestException if any permission ID in update is invalid", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findById")
        .mockResolvedValue(sampleRole);
      mockPrismaService.client.permission.findMany.mockResolvedValue([]);

      const dto: UpdateRoleDto = {
        permissionIds: ["non-existent-id"],
      };

      await expect(service.update("role-uuid-1", dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("clears description when empty string is provided in update", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findById")
        .mockResolvedValue(sampleRole);
      const updateSpy = jest
        .spyOn(RoleRepository.prototype, "update")
        .mockResolvedValue({ ...sampleRole, description: null });

      const dto: UpdateRoleDto = {
        description: "",
      };

      await service.update("role-uuid-1", dto);
      expect(updateSpy).toHaveBeenCalledWith("role-uuid-1", {
        description: null,
      });
    });
  });

  describe("remove", () => {
    it("deletes a role successfully", async () => {
      jest
        .spyOn(RoleRepository.prototype, "findById")
        .mockResolvedValue(sampleRole);
      const deleteSpy = jest
        .spyOn(RoleRepository.prototype, "delete")
        .mockResolvedValue(sampleRole);

      const result = await service.remove("role-uuid-1");
      expect(result).toEqual({ success: true, id: "role-uuid-1" });
      expect(deleteSpy).toHaveBeenCalledWith("role-uuid-1");
    });

    it("throws NotFoundException if role to delete does not exist", async () => {
      jest.spyOn(RoleRepository.prototype, "findById").mockResolvedValue(null);

      await expect(service.remove("missing-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
