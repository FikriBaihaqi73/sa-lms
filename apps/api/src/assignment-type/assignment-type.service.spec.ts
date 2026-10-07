import { ConflictException, NotFoundException } from "@nestjs/common";
import { AssignmentTypeRepository } from "@repo/shared/infrastructure/repository/assignment-type.repository";
import type {
  CreateAssignmentTypeDto,
  UpdateAssignmentTypeDto,
} from "@repo/shared/schemas/assignment-type.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { AssignmentTypeService } from "./assignment-type.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AssignmentTypeService", () => {
  let service: AssignmentTypeService;

  beforeEach(() => {
    service = new AssignmentTypeService({} as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findAll", () => {
    it("should return all assignment types", async () => {
      const mockList = [
        { id: "1", name: "Tugas Mandiri", description: "Tugas individu" },
        { id: "2", name: "Tugas Kelompok", description: "Tugas tim" },
      ];
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findAll")
        .mockResolvedValue(mockList as never);

      const result = await service.findAll();
      expect(result).toEqual(mockList);
    });
  });

  describe("findOne", () => {
    it("should return an assignment type when found", async () => {
      const mockItem = { id: "1", name: "Tugas Mandiri", description: null };
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(mockItem as never);

      const result = await service.findOne("1");
      expect(result).toEqual(mockItem);
    });

    it("should throw NotFoundException when assignment type not found", async () => {
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(service.findOne("not-found")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should successfully create when name is unique", async () => {
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findByName")
        .mockResolvedValue(null);
      const createdItem = {
        id: "1",
        name: "Proyek",
        description: "Proyek akhir",
      };
      jest
        .spyOn(AssignmentTypeRepository.prototype, "create")
        .mockResolvedValue(createdItem as never);

      const dto: CreateAssignmentTypeDto = {
        name: "Proyek",
        description: "Proyek akhir",
      };

      const result = await service.create(dto);
      expect(result).toEqual(createdItem);
    });

    it("should throw ConflictException when name already exists", async () => {
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findByName")
        .mockResolvedValue({ id: "existing-id", name: "Proyek" } as never);

      await expect(
        service.create({ name: "Proyek", description: "Deskripsi" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("should successfully update assignment type", async () => {
      const existing = { id: "1", name: "Proyek Lama", description: null };
      const updated = {
        id: "1",
        name: "Proyek Baru",
        description: "Deskripsi baru",
      };

      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(existing as never);
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findByName")
        .mockResolvedValue(null);
      jest
        .spyOn(AssignmentTypeRepository.prototype, "update")
        .mockResolvedValue(updated as never);

      const dto: UpdateAssignmentTypeDto = {
        name: "Proyek Baru",
        description: "Deskripsi baru",
      };

      const result = await service.update("1", dto);
      expect(result).toEqual(updated);
    });

    it("should allow keeping the same name for the same ID", async () => {
      const existing = { id: "1", name: "Proyek", description: "Lama" };
      const updated = { id: "1", name: "Proyek", description: "Baru" };

      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(existing as never);
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findByName")
        .mockResolvedValue(existing as never);
      jest
        .spyOn(AssignmentTypeRepository.prototype, "update")
        .mockResolvedValue(updated as never);

      const result = await service.update("1", {
        name: "Proyek",
        description: "Baru",
      });

      expect(result).toEqual(updated);
    });

    it("should throw ConflictException if updated name belongs to another item", async () => {
      const existing = { id: "1", name: "Tugas", description: null };
      const other = { id: "2", name: "Kuis", description: null };

      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(existing as never);
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findByName")
        .mockResolvedValue(other as never);

      await expect(
        service.update("1", { name: "Kuis" }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw NotFoundException if trying to update non-existent item", async () => {
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.update("non-existent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should soft delete assignment type when found", async () => {
      const existing = { id: "1", name: "Tugas", description: null };

      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(existing as never);
      jest
        .spyOn(AssignmentTypeRepository.prototype, "delete")
        .mockResolvedValue({
          ...existing,
          deleted_at: new Date(),
        } as never);

      const result = await service.remove("1");
      expect(result).toEqual({ success: true, id: "1" });
    });

    it("should throw NotFoundException if item to delete does not exist", async () => {
      jest
        .spyOn(AssignmentTypeRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(service.remove("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
