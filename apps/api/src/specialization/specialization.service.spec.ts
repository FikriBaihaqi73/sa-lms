import {
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { SpecializationService } from "./specialization.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {
      specializations: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
  },
}));

describe("SpecializationService", () => {
  let service: SpecializationService;
  let mockPrisma: {
    client: {
      specializations: {
        findFirst: jest.Mock;
        findMany: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
      };
    };
  };

  const sampleSpecialization = {
    id: "spec-uuid-1",
    name: "Rekayasa Perangkat Lunak",
    description: "Fokus software engineering",
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { PrismaService } = jest.requireMock("../prisma/prisma.service");
    mockPrisma = new PrismaService();
    service = new SpecializationService(mockPrisma as any);
  });

  describe("findAll", () => {
    it("returns all active specializations", async () => {
      mockPrisma.client.specializations.findMany.mockResolvedValue([sampleSpecialization]);

      const result = await service.findAll();

      expect(result).toEqual([sampleSpecialization]);
      expect(mockPrisma.client.specializations.findMany).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("returns specialization by ID", async () => {
      mockPrisma.client.specializations.findFirst.mockResolvedValue(sampleSpecialization);

      const result = await service.findOne("spec-uuid-1");

      expect(result).toEqual(sampleSpecialization);
    });

    it("throws NotFoundException when ID does not exist", async () => {
      mockPrisma.client.specializations.findFirst.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("creates specialization after trimming name", async () => {
      mockPrisma.client.specializations.findFirst.mockResolvedValue(null);
      mockPrisma.client.specializations.create.mockResolvedValue(sampleSpecialization);

      const result = await service.create({
        name: "  Rekayasa Perangkat Lunak  ",
        description: "  Fokus software engineering  ",
      });

      expect(result).toEqual(sampleSpecialization);
      expect(mockPrisma.client.specializations.findFirst).toHaveBeenCalledWith({
        where: {
          name: "Rekayasa Perangkat Lunak",
          deleted_at: null,
        },
        select: expect.any(Object),
      });
      expect(mockPrisma.client.specializations.create).toHaveBeenCalledWith({
        data: {
          name: "Rekayasa Perangkat Lunak",
          description: "Fokus software engineering",
        },
        select: expect.any(Object),
      });
    });

    it("throws ConflictException when specialization name already exists", async () => {
      mockPrisma.client.specializations.findFirst.mockResolvedValue(sampleSpecialization);

      await expect(
        service.create({
          name: "Rekayasa Perangkat Lunak",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("updates specialization successfully", async () => {
      mockPrisma.client.specializations.findFirst
        .mockResolvedValueOnce(sampleSpecialization) // findOne check
        .mockResolvedValueOnce(null); // name collision check
      mockPrisma.client.specializations.update.mockResolvedValue({
        ...sampleSpecialization,
        name: "AI & Data Science",
      });

      const result = await service.update("spec-uuid-1", {
        name: "  AI & Data Science  ",
      });

      expect(result.name).toBe("AI & Data Science");
      expect(mockPrisma.client.specializations.update).toHaveBeenCalledWith({
        where: { id: "spec-uuid-1" },
        data: expect.objectContaining({ name: "AI & Data Science" }),
        select: expect.any(Object),
      });
    });

    it("throws ConflictException if new name is already taken by another specialization", async () => {
      mockPrisma.client.specializations.findFirst
        .mockResolvedValueOnce(sampleSpecialization) // findOne
        .mockResolvedValueOnce({ ...sampleSpecialization, id: "spec-uuid-2" }); // another item has same name

      await expect(
        service.update("spec-uuid-1", {
          name: "Duplicate Name",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("remove", () => {
    it("soft deletes specialization", async () => {
      mockPrisma.client.specializations.findFirst.mockResolvedValue(sampleSpecialization);
      mockPrisma.client.specializations.update.mockResolvedValue({
        ...sampleSpecialization,
        deleted_at: new Date(),
      });

      const result = await service.remove("spec-uuid-1");

      expect(result).toEqual({ success: true, id: "spec-uuid-1" });
      expect(mockPrisma.client.specializations.update).toHaveBeenCalledWith({
        where: { id: "spec-uuid-1" },
        data: { deleted_at: expect.any(Date) },
        select: expect.any(Object),
      });
    });

    it("throws NotFoundException if specialization does not exist", async () => {
      mockPrisma.client.specializations.findFirst.mockResolvedValue(null);

      await expect(service.remove("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
