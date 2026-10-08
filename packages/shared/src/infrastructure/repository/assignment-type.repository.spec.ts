/// <reference types="jest" />
import type { PrismaClient } from "#generated/client";
import { AssignmentTypeRepository } from "vitest";

describe("AssignmentTypeRepository", () => {
  const assignmentTypes = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const prisma = { assignmentTypes } as unknown as PrismaClient;
  const repository = new AssignmentTypeRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates an assignment type with name and description", async () => {
      const mockResult = {
        id: "type-uuid-1",
        name: "Tugas Harian",
        description: "Tugas pekerjaan rumah berkala",
        created_at: new Date(),
        updated_at: new Date(),
      };
      assignmentTypes.create.mockResolvedValue(mockResult);

      const result = await repository.create({
        name: "Tugas Harian",
        description: "Tugas pekerjaan rumah berkala",
      });

      expect(result).toEqual(mockResult);
      expect(assignmentTypes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            name: "Tugas Harian",
            description: "Tugas pekerjaan rumah berkala",
          },
        }),
      );
    });

    it("creates an assignment type with null description when not provided", async () => {
      const mockResult = {
        id: "type-uuid-2",
        name: "Proyek Akhir",
        description: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      assignmentTypes.create.mockResolvedValue(mockResult);

      const result = await repository.create({
        name: "Proyek Akhir",
      });

      expect(result).toEqual(mockResult);
      expect(assignmentTypes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            name: "Proyek Akhir",
            description: null,
          },
        }),
      );
    });
  });

  describe("findById", () => {
    it("returns assignment type when found and not deleted", async () => {
      const mockResult = {
        id: "type-uuid-1",
        name: "Tugas Harian",
        description: "Tugas pekerjaan rumah berkala",
        created_at: new Date(),
        updated_at: new Date(),
      };
      assignmentTypes.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findById("type-uuid-1");
      expect(result).toEqual(mockResult);
      expect(assignmentTypes.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "type-uuid-1",
            deleted_at: null,
          },
        }),
      );
    });

    it("returns null when assignment type does not exist or is deleted", async () => {
      assignmentTypes.findFirst.mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("returns assignment type matching name and not deleted", async () => {
      const mockResult = {
        id: "type-uuid-1",
        name: "Tugas Harian",
        description: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      assignmentTypes.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findByName("Tugas Harian");
      expect(result).toEqual(mockResult);
      expect(assignmentTypes.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: "Tugas Harian",
            deleted_at: null,
          },
        }),
      );
    });

    it("returns null when name is not found", async () => {
      assignmentTypes.findFirst.mockResolvedValue(null);

      const result = await repository.findByName("NonExistent");
      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("returns list of active assignment types", async () => {
      const mockList = [
        {
          id: "type-uuid-1",
          name: "Tugas Harian",
          description: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "type-uuid-2",
          name: "Kuis",
          description: "Kuis mingguan",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      assignmentTypes.findMany.mockResolvedValue(mockList);

      const result = await repository.findAll();
      expect(result).toEqual(mockList);
      expect(assignmentTypes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted_at: null },
        }),
      );
    });
  });

  describe("update", () => {
    it("updates both name and description", async () => {
      const mockResult = {
        id: "type-uuid-1",
        name: "Tugas Mingguan",
        description: "Diperbarui",
        created_at: new Date(),
        updated_at: new Date(),
      };
      assignmentTypes.update.mockResolvedValue(mockResult);

      const result = await repository.update("type-uuid-1", {
        name: "Tugas Mingguan",
        description: "Diperbarui",
      });

      expect(result).toEqual(mockResult);
      expect(assignmentTypes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "type-uuid-1" },
          data: {
            name: "Tugas Mingguan",
            description: "Diperbarui",
          },
        }),
      );
    });

    it("updates only description when name is not provided", async () => {
      const mockResult = {
        id: "type-uuid-1",
        name: "Tugas Harian",
        description: "Deskripsi baru saja",
        created_at: new Date(),
        updated_at: new Date(),
      };
      assignmentTypes.update.mockResolvedValue(mockResult);

      const result = await repository.update("type-uuid-1", {
        description: "Deskripsi baru saja",
      });

      expect(result).toEqual(mockResult);
      expect(assignmentTypes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "type-uuid-1" },
          data: {
            description: "Deskripsi baru saja",
          },
        }),
      );
    });
  });

  describe("delete", () => {
    it("soft deletes an assignment type by recording deleted_at", async () => {
      const mockDeleted = {
        id: "type-uuid-1",
        name: "Tugas Harian",
        description: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      assignmentTypes.update.mockResolvedValue(mockDeleted);

      const result = await repository.delete("type-uuid-1");
      expect(result).toEqual(mockDeleted);
      expect(assignmentTypes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "type-uuid-1" },
          data: {
            deleted_at: expect.any(Date),
          },
        }),
      );
    });
  });
});
