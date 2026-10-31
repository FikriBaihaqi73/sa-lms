import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { ScheduleRepository } from "@repo/shared/infrastructure/repository/schedule.repository";
import { PrismaService } from "../prisma/prisma.service";
import { ScheduleService } from "./schedule.service";

jest.mock("@repo/shared/infrastructure/repository/schedule.repository");

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("ScheduleService", () => {
  let service: ScheduleService;
  let mockRepositoryInstance: jest.Mocked<ScheduleRepository>;

  const mockSchedule = {
    id: "sched-1",
    classSubjectId: "cs-1",
    classroomId: "room-1",
    day: "Senin",
    startTime: new Date("1970-01-01T07:30:00.000Z"),
    endTime: new Date("1970-01-01T09:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    classroom: {
      id: "room-1",
      institutionId: "inst-1",
      roomCode: "R101",
      roomName: "Ruang 101",
      building: "Gedung A",
      floor: 1,
      capacity: 30,
      description: null,
      institution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    classSubject: null,
  };

  beforeEach(async () => {
    mockRepositoryInstance = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByClassSubject: jest.fn(),
      findByClassroom: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ScheduleRepository>;

    (ScheduleRepository as jest.Mock).mockImplementation(
      () => mockRepositoryInstance,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: PrismaService,
          useValue: {
            client: {},
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated schedules", async () => {
      const mockResult = {
        data: [mockSchedule],
        meta: {
          totalData: 1,
          totalPages: 1,
          currentPage: 1,
          perPage: 10,
        },
      };
      mockRepositoryInstance.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll(1, 10, {
        search: "Senin",
        day: "Senin",
      });

      expect(result).toEqual(mockResult);
      expect(mockRepositoryInstance.findAll).toHaveBeenCalledWith(1, 10, {
        search: "Senin",
        day: "Senin",
      });
    });
  });

  describe("findOne", () => {
    it("should return a schedule by ID if found", async () => {
      mockRepositoryInstance.findById.mockResolvedValue(mockSchedule);

      const result = await service.findOne("sched-1");

      expect(result).toEqual(mockSchedule);
      expect(mockRepositoryInstance.findById).toHaveBeenCalledWith("sched-1");
    });

    it("should throw NotFoundException if schedule does not exist", async () => {
      mockRepositoryInstance.findById.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create schedule with HH:mm time format", async () => {
      const dto = {
        classSubjectId: "cs-1",
        classroomId: "room-1",
        day: "Senin",
        startTime: "07:30",
        endTime: "09:00",
      };
      mockRepositoryInstance.create.mockResolvedValue(mockSchedule);

      const result = await service.create(dto);

      expect(result).toEqual(mockSchedule);
      expect(mockRepositoryInstance.create).toHaveBeenCalledWith({
        classSubjectId: "cs-1",
        classroomId: "room-1",
        day: "Senin",
        startTime: new Date("1970-01-01T07:30:00.000Z"),
        endTime: new Date("1970-01-01T09:00:00.000Z"),
      });
    });

    it("should create schedule without times", async () => {
      const dto = {
        classSubjectId: "cs-1",
        classroomId: "room-1",
        day: "Selasa",
      };
      mockRepositoryInstance.create.mockResolvedValue(mockSchedule);

      const result = await service.create(dto);

      expect(result).toEqual(mockSchedule);
      expect(mockRepositoryInstance.create).toHaveBeenCalledWith({
        classSubjectId: "cs-1",
        classroomId: "room-1",
        day: "Selasa",
      });
    });
  });

  describe("update", () => {
    it("should update a schedule if found", async () => {
      mockRepositoryInstance.findById.mockResolvedValue(mockSchedule);
      mockRepositoryInstance.update.mockResolvedValue(mockSchedule);

      const dto = {
        day: "Rabu",
        startTime: "08:00",
        endTime: "09:30",
      };

      const result = await service.update("sched-1", dto);

      expect(result).toEqual(mockSchedule);
      expect(mockRepositoryInstance.update).toHaveBeenCalledWith("sched-1", {
        day: "Rabu",
        startTime: new Date("1970-01-01T08:00:00.000Z"),
        endTime: new Date("1970-01-01T09:30:00.000Z"),
      });
    });

    it("should throw NotFoundException if updating non-existent schedule", async () => {
      mockRepositoryInstance.findById.mockResolvedValue(null);

      await expect(
        service.update("non-existent", { day: "Kamis" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should soft delete a schedule if found", async () => {
      mockRepositoryInstance.findById.mockResolvedValue(mockSchedule);
      mockRepositoryInstance.delete.mockResolvedValue(mockSchedule);

      const result = await service.remove("sched-1");

      expect(result).toEqual({ success: true, id: "sched-1" });
      expect(mockRepositoryInstance.delete).toHaveBeenCalledWith("sched-1");
    });

    it("should throw NotFoundException if deleting non-existent schedule", async () => {
      mockRepositoryInstance.findById.mockResolvedValue(null);

      await expect(service.remove("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
