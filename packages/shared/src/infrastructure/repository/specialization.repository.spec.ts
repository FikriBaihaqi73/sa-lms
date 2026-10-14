import type { PrismaClient } from "#generated/client";
import { SpecializationRepository } from "./specialization.repository";

describe("SpecializationRepository", () => {
  const specializations = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };

  const prisma = {
    specializations,
  } as unknown as PrismaClient;

  const repository = new SpecializationRepository(prisma);

  const sampleSpecialization = {
    id: "spec-uuid-1",
    name: "Rekayasa Perangkat Lunak",
    description: "Fokus software engineering",
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a specialization with name and description", async () => {
      specializations.create.mockResolvedValue(sampleSpecialization);

      const result = await repository.create({
        name: "Rekayasa Perangkat Lunak",
        description: "Fokus software engineering",
      });

      expect(result).toEqual(sampleSpecialization);
      expect(specializations.create).toHaveBeenCalledWith({
        data: {
          name: "Rekayasa Perangkat Lunak",
          description: "Fokus software engineering",
        },
        select: expect.any(Object),
      });
    });

    it("creates a specialization with null description when not provided", async () => {
      specializations.create.mockResolvedValue({
        ...sampleSpecialization,
        description: null,
      });

      const result = await repository.create({
        name: "Rekayasa Perangkat Lunak",
      });

      expect(result.description).toBeNull();
      expect(specializations.create).toHaveBeenCalledWith({
        data: {
          name: "Rekayasa Perangkat Lunak",
          description: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("findById", () => {
    it("returns specialization when found", async () => {
      specializations.findFirst.mockResolvedValue(sampleSpecialization);

      const result = await repository.findById("spec-uuid-1");

      expect(result).toEqual(sampleSpecialization);
      expect(specializations.findFirst).toHaveBeenCalledWith({
        where: {
          id: "spec-uuid-1",
          deleted_at: null,
        },
        select: expect.any(Object),
      });
    });

    it("returns null when specialization is not found", async () => {
      specializations.findFirst.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("returns specialization matching name", async () => {
      specializations.findFirst.mockResolvedValue(sampleSpecialization);

      const result = await repository.findByName("Rekayasa Perangkat Lunak");

      expect(result).toEqual(sampleSpecialization);
      expect(specializations.findFirst).toHaveBeenCalledWith({
        where: {
          name: "Rekayasa Perangkat Lunak",
          deleted_at: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("findAll", () => {
    it("returns list of active specializations ordered by created_at", async () => {
      specializations.findMany.mockResolvedValue([sampleSpecialization]);

      const result = await repository.findAll();

      expect(result).toEqual([sampleSpecialization]);
      expect(specializations.findMany).toHaveBeenCalledWith({
        where: {
          deleted_at: null,
        },
        orderBy: {
          created_at: "asc",
        },
        select: expect.any(Object),
      });
    });
  });

  describe("update", () => {
    it("updates name and description", async () => {
      const updated = {
        ...sampleSpecialization,
        name: "Software Engineering Modern",
        description: "Updated description",
      };
      specializations.update.mockResolvedValue(updated);

      const result = await repository.update("spec-uuid-1", {
        name: "Software Engineering Modern",
        description: "Updated description",
      });

      expect(result).toEqual(updated);
      expect(specializations.update).toHaveBeenCalledWith({
        where: {
          id: "spec-uuid-1",
        },
        data: {
          name: "Software Engineering Modern",
          description: "Updated description",
        },
        select: expect.any(Object),
      });
    });
  });

  describe("delete", () => {
    it("soft deletes specialization by setting deleted_at", async () => {
      specializations.update.mockResolvedValue({
        ...sampleSpecialization,
        deleted_at: new Date(),
      });

      const result = await repository.delete("spec-uuid-1");

      expect(result).toBeDefined();
      expect(specializations.update).toHaveBeenCalledWith({
        where: {
          id: "spec-uuid-1",
        },
        data: {
          deleted_at: expect.any(Date),
        },
        select: expect.any(Object),
      });
    });
  });
});
