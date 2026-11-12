import { ConflictException, NotFoundException } from "@nestjs/common";
import { ClassroomRepository } from "@repo/shared/infrastructure/repository/classroom.repository";
import type {
  CreateClassroomDto,
  UpdateClassroomDto,
} from "@repo/shared/schemas/classroom.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { ClassroomService } from "./classroom.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("ClassroomService", () => {
  let service: ClassroomService;
  let mockPrisma: PrismaService;

  beforeEach(() => {
    mockPrisma = {
      client: {
        profile: {
          findFirst: jest.fn().mockResolvedValue({ institutionId: "inst-1" }),
        },
      },
    } as unknown as PrismaService;

    service = new ClassroomService(mockPrisma);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findOne", () => {
    it("returns classroom when found", async () => {
      const mockClassroom = {
        id: "room-1",
        roomCode: "R-101",
        roomName: "Ruang A",
      };
      jest
        .spyOn(ClassroomRepository.prototype, "findById")
        .mockResolvedValue(mockClassroom as never);

      const result = await service.findOne("room-1", "user-1");
      expect(result).toEqual(mockClassroom);
    });

    it("throws NotFoundException when not found", async () => {
      jest
        .spyOn(ClassroomRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(service.findOne("missing", "user-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("creates classroom with null floor and null capacity (optional fields)", async () => {
      jest
        .spyOn(ClassroomRepository.prototype, "findByRoomCode")
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(ClassroomRepository.prototype, "create")
        .mockResolvedValue({
          id: "new-room",
          roomCode: "R-102",
          roomName: "Ruang B",
          floor: null,
          capacity: null,
        } as never);

      const dto: CreateClassroomDto = {
        institutionId: "inst-1",
        roomCode: "R-102",
        roomName: "Ruang B",
        floor: null,
        capacity: null,
      };

      const result = await service.create("user-1", dto);
      expect(result).toBeDefined();
      expect(createSpy).toHaveBeenCalledWith({
        institutionId: "inst-1",
        roomCode: "R-102",
        roomName: "Ruang B",
        floor: null,
        capacity: null,
      });
    });

    it("creates classroom with numeric floor and capacity", async () => {
      jest
        .spyOn(ClassroomRepository.prototype, "findByRoomCode")
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(ClassroomRepository.prototype, "create")
        .mockResolvedValue({
          id: "new-room",
          roomCode: "R-103",
          roomName: "Ruang C",
          floor: 2,
          capacity: 40,
        } as never);

      const dto: CreateClassroomDto = {
        institutionId: "inst-1",
        roomCode: "R-103",
        roomName: "Ruang C",
        floor: 2,
        capacity: 40,
      };

      await service.create("user-1", dto);
      expect(createSpy).toHaveBeenCalledWith({
        institutionId: "inst-1",
        roomCode: "R-103",
        roomName: "Ruang C",
        floor: 2,
        capacity: 40,
      });
    });

    it("throws ConflictException on duplicate roomCode", async () => {
      jest
        .spyOn(ClassroomRepository.prototype, "findByRoomCode")
        .mockResolvedValue({ id: "exist" } as never);

      const dto: CreateClassroomDto = {
        institutionId: "inst-1",
        roomCode: "R-101",
        roomName: "Ruang Duplikat",
      };

      await expect(service.create("user-1", dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it("throws BadRequestException when institutionId cannot be resolved", async () => {
      (mockPrisma.client.profile.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      const dto: CreateClassroomDto = {
        institutionId: "",
        roomCode: "R-999",
        roomName: "Ruang X",
      };

      await expect(service.create("user-unknown", dto)).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("updates classroom with null floor and capacity to clear them", async () => {
      jest
        .spyOn(ClassroomRepository.prototype, "findById")
        .mockResolvedValue({ id: "room-1" } as never);
      const updateSpy = jest
        .spyOn(ClassroomRepository.prototype, "update")
        .mockResolvedValue({
          id: "room-1",
          floor: null,
          capacity: null,
        } as never);

      const dto: UpdateClassroomDto = {
        floor: null,
        capacity: null,
      };

      await service.update("room-1", "user-1", dto);
      expect(updateSpy).toHaveBeenCalledWith("room-1", {
        institutionId: "inst-1",
        floor: null,
        capacity: null,
      });
    });

    it("throws ConflictException when updating to an existing roomCode", async () => {
      jest
        .spyOn(ClassroomRepository.prototype, "findById")
        .mockResolvedValue({ id: "room-1" } as never);
      jest
        .spyOn(ClassroomRepository.prototype, "findByRoomCode")
        .mockResolvedValue({ id: "other-room" } as never);

      const dto: UpdateClassroomDto = {
        roomCode: "R-EXISTING",
      };

      await expect(
        service.update("room-1", "user-1", dto),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe("remove", () => {
    it("soft-deletes classroom", async () => {
      jest
        .spyOn(ClassroomRepository.prototype, "findById")
        .mockResolvedValue({ id: "room-1" } as never);
      const deleteSpy = jest
        .spyOn(ClassroomRepository.prototype, "delete")
        .mockResolvedValue({ id: "room-1" } as never);

      const result = await service.remove("room-1", "user-1");
      expect(result).toEqual({ success: true, id: "room-1" });
      expect(deleteSpy).toHaveBeenCalledWith("room-1");
    });
  });
});
