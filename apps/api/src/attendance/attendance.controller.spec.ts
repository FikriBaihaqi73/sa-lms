import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import type { Request } from "express";
import { ROLES_KEY } from "../auth/roles.decorator";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("AttendanceController", () => {
  let controller: AttendanceController;
  let service: AttendanceService;

  const mockService = {
    findAll: jest.fn(),
    getSummary: jest.fn(),
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
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("role authorization", () => {
    const reflector = new Reflector();

    it("restricts the controller to the admin role only", () => {
      const requiredRoles = reflector.get<string[]>(
        ROLES_KEY,
        AttendanceController,
      );
      expect(requiredRoles).toEqual(["admin"]);
    });
  });

  describe("endpoints", () => {
    const mockRecord = {
      id: "att-1",
      schedule_id: "sched-1",
      student_id: "stud-1",
      attendance_status_id: "stat-1",
      notes: "Hadir tepat waktu",
    };

    it("findAll forwards filters and authenticated admin user id", async () => {
      mockService.findAll.mockResolvedValue({
        data: [mockRecord],
        meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
      });

      const result = await controller.findAll(
        asAdminRequest(),
        "1",
        "10",
        "Ahmad",
        "sched-1",
        "stud-1",
        "stat-1",
        "2026-11-04",
        "class-1",
      );

      expect(result).toEqual(
        ResponseHelper.success(
          [mockRecord],
          "Attendances retrieved successfully",
          200,
          { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
        ),
      );
      expect(service.findAll).toHaveBeenCalledWith(
        1,
        10,
        {
          search: "Ahmad",
          schedule_id: "sched-1",
          student_id: "stud-1",
          attendance_status_id: "stat-1",
          attendance_date: "2026-11-04",
          class_id: "class-1",
        },
        ADMIN_USER_ID,
      );
    });

    it("getSummary returns summary stats", async () => {
      const mockSummary = {
        total: 10,
        present: 8,
        permission: 1,
        sick: 1,
        absent: 0,
        attendanceRate: 80,
      };
      mockService.getSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(
        asAdminRequest(),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "class-1",
      );

      expect(result).toEqual(
        ResponseHelper.success(
          mockSummary,
          "Attendance summary retrieved successfully",
        ),
      );
      expect(service.getSummary).toHaveBeenCalledWith(
        {
          search: undefined,
          schedule_id: undefined,
          student_id: undefined,
          attendance_status_id: undefined,
          attendance_date: undefined,
          class_id: "class-1",
        },
        ADMIN_USER_ID,
      );
    });

    it("findOne forwards id and authenticated admin user id", async () => {
      mockService.findOne.mockResolvedValue(mockRecord);

      const result = await controller.findOne("att-1", asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Attendance detail retrieved successfully",
        ),
      );
      expect(service.findOne).toHaveBeenCalledWith("att-1", ADMIN_USER_ID);
    });

    it("create forwards dto and authenticated admin user id", async () => {
      mockService.create.mockResolvedValue(mockRecord);
      const dto = {
        schedule_id: "sched-1",
        student_id: "stud-1",
        attendance_status_id: "stat-1",
      };

      const result = await controller.create(dto as never, asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Attendance created successfully",
          201,
        ),
      );
      expect(service.create).toHaveBeenCalledWith(dto, ADMIN_USER_ID);
    });

    it("update forwards id, dto, and authenticated admin user id", async () => {
      mockService.update.mockResolvedValue(mockRecord);
      const dto = { notes: "Izin surat dokter" };

      const result = await controller.update("att-1", dto as never, asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Attendance updated successfully",
        ),
      );
      expect(service.update).toHaveBeenCalledWith("att-1", dto, ADMIN_USER_ID);
    });

    it("remove forwards id and authenticated admin user id", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "att-1" });

      const result = await controller.remove("att-1", asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "att-1" },
          "Attendance deleted successfully",
        ),
      );
      expect(service.remove).toHaveBeenCalledWith("att-1", ADMIN_USER_ID);
    });
  });
});

