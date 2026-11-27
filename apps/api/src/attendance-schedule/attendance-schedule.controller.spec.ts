import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import type { Request } from "express";
import { AttendanceScheduleController } from "./attendance-schedule.controller";
import { AttendanceScheduleService } from "./attendance-schedule.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

interface AuthenticatedRequest extends Request {
  user: { sub: string };
}

describe("AttendanceScheduleController", () => {
  let controller: AttendanceScheduleController;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    toggleStatus: jest.fn(),
    updateDays: jest.fn(),
    remove: jest.fn(),
  };

  const mockReq = {
    user: { sub: "user-admin-1" },
  } as unknown as AuthenticatedRequest;

  const mockRecord = {
    id: "11111111-1111-4111-8111-111111111111",
    academicYearId: "22222222-2222-4222-8222-222222222222",
    classId: "33333333-3333-4333-8333-333333333333",
    scheduleId: null,
    title: "Absensi Harian 1A",
    scheduleType: "STANDALONE",
    activeDays: ["SENIN", "SELASA"],
    specificDate: null,
    startTime: null,
    endTime: null,
    isActive: true,
    notes: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceScheduleController],
      providers: [
        { provide: AttendanceScheduleService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AttendanceScheduleController>(
      AttendanceScheduleController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("findAll returns data and meta with stats wrapped in ResponseHelper.success", async () => {
    const serviceResult = {
      data: [mockRecord],
      meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 20 },
      stats: { total: 1, active: 1, inactive: 0, standalone: 1 },
    };
    mockService.findAll.mockResolvedValue(serviceResult);

    const response = await controller.findAll(mockReq, { page: 1, limit: 20 });
    expect(response).toEqual(
      ResponseHelper.success(
        [mockRecord],
        "Attendance schedules retrieved successfully",
        200,
        { ...serviceResult.meta, stats: serviceResult.stats },
      ),
    );
    expect(mockService.findAll).toHaveBeenCalledWith("user-admin-1", {
      page: 1,
      limit: 20,
    });
  });

  it("findOne returns detail wrapped in ResponseHelper.success", async () => {
    mockService.findOne.mockResolvedValue(mockRecord);
    const response = await controller.findOne(mockReq, mockRecord.id);
    expect(response).toEqual(
      ResponseHelper.success(
        mockRecord,
        "Attendance schedule detail retrieved successfully",
      ),
    );
  });

  it("create returns 201 ResponseHelper.success", async () => {
    mockService.create.mockResolvedValue(mockRecord);
    const payload = {
      academicYearId: mockRecord.academicYearId,
      classId: mockRecord.classId,
      title: mockRecord.title,
      scheduleType: "STANDALONE" as const,
      activeDays: ["SENIN" as const, "SELASA" as const],
      isActive: true,
    };
    const response = await controller.create(mockReq, payload);
    expect(response).toEqual(
      ResponseHelper.success(
        mockRecord,
        "Attendance schedule created successfully",
        201,
      ),
    );
  });

  it("update returns updated record wrapped in ResponseHelper.success", async () => {
    const updated = { ...mockRecord, title: "Updated" };
    mockService.update.mockResolvedValue(updated);
    const response = await controller.update(mockReq, mockRecord.id, {
      title: "Updated",
    });
    expect(response).toEqual(
      ResponseHelper.success(
        updated,
        "Attendance schedule updated successfully",
      ),
    );
  });

  it("toggleStatus updates isActive flag", async () => {
    const toggled = { ...mockRecord, isActive: false };
    mockService.toggleStatus.mockResolvedValue(toggled);
    const response = await controller.toggleStatus(mockReq, mockRecord.id, {
      isActive: false,
    });
    expect(response).toEqual(
      ResponseHelper.success(
        toggled,
        "Attendance schedule status updated successfully",
      ),
    );
  });

  it("updateDays updates activeDays array", async () => {
    const updated = { ...mockRecord, activeDays: ["SENIN"] };
    mockService.updateDays.mockResolvedValue(updated);
    const response = await controller.updateDays(mockReq, mockRecord.id, {
      activeDays: ["SENIN"],
    });
    expect(response).toEqual(
      ResponseHelper.success(
        updated,
        "Attendance schedule active days updated successfully",
      ),
    );
  });

  it("remove soft deletes schedule", async () => {
    mockService.remove.mockResolvedValue(mockRecord);
    const response = await controller.remove(mockReq, mockRecord.id);
    expect(response).toEqual(
      ResponseHelper.success(
        mockRecord,
        "Attendance schedule deleted successfully",
      ),
    );
  });
});
