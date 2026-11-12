import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import type { Request } from "express";
import { ClassroomController } from "./classroom.controller";
import { ClassroomService } from "./classroom.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("ClassroomController", () => {
  let controller: ClassroomController;
  let service: ClassroomService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const asAdminRequest = (): Request & { user: { sub: string } } =>
    ({ user: { sub: ADMIN_USER_ID } }) as unknown as Request & {
      user: { sub: string };
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomController],
      providers: [
        {
          provide: ClassroomService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ClassroomController>(ClassroomController);
    service = module.get<ClassroomService>(ClassroomService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("endpoints", () => {
    const mockRecord = {
      id: "room-1",
      roomCode: "R-101",
      roomName: "Ruang Kelas 1",
      building: null,
      floor: null,
      capacity: null,
    };

    it("findAll returns list wrapped in ResponseHelper.success with meta", async () => {
      mockService.findAll.mockResolvedValue({
        data: [mockRecord],
        meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
      });

      const result = await controller.findAll(
        asAdminRequest(),
        "1",
        "10",
        "R-101",
      );

      expect(result).toEqual(
        ResponseHelper.success(
          [mockRecord],
          "Classrooms retrieved successfully",
          200,
          { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
        ),
      );
      expect(service.findAll).toHaveBeenCalledWith(ADMIN_USER_ID, 1, 10, {
        search: "R-101",
      });
    });

    it("findOne returns detail", async () => {
      mockService.findOne.mockResolvedValue(mockRecord);

      const result = await controller.findOne(asAdminRequest(), "room-1");

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Classroom detail retrieved successfully",
        ),
      );
      expect(service.findOne).toHaveBeenCalledWith("room-1", ADMIN_USER_ID);
    });

    it("create forwards dto with null floor and capacity", async () => {
      mockService.create.mockResolvedValue(mockRecord);
      const dto = {
        institutionId: "inst-1",
        roomCode: "R-101",
        roomName: "Ruang Kelas 1",
        floor: null,
        capacity: null,
      };

      const result = await controller.create(asAdminRequest(), dto as never);

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Classroom created successfully",
          201,
        ),
      );
      expect(service.create).toHaveBeenCalledWith(ADMIN_USER_ID, dto);
    });

    it("update forwards id and dto with null floor and capacity", async () => {
      mockService.update.mockResolvedValue(mockRecord);
      const dto = {
        floor: null,
        capacity: null,
      };

      const result = await controller.update(
        asAdminRequest(),
        "room-1",
        dto as never,
      );

      expect(result).toEqual(
        ResponseHelper.success(mockRecord, "Classroom updated successfully"),
      );
      expect(service.update).toHaveBeenCalledWith("room-1", ADMIN_USER_ID, dto);
    });

    it("remove forwards id and returns deleted confirmation", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "room-1" });

      const result = await controller.remove(asAdminRequest(), "room-1");

      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "room-1" },
          "Classroom deleted successfully",
        ),
      );
      expect(service.remove).toHaveBeenCalledWith("room-1", ADMIN_USER_ID);
    });
  });
});
