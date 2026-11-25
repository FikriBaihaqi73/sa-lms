import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { AttendanceScheduleService } from "./attendance-schedule.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AttendanceScheduleService", () => {
  let service: AttendanceScheduleService;

  const mockPrismaClient = {
    profile: { findFirst: jest.fn() },
    academicYears: { findFirst: jest.fn() },
    classes: { findFirst: jest.fn() },
    schedule: { findFirst: jest.fn() },
    attendanceSchedules: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockScheduleRecord = {
    id: "11111111-1111-4111-8111-111111111111",
    academicYearId: "22222222-2222-4222-8222-222222222222",
    classId: "33333333-3333-4333-8333-333333333333",
    scheduleId: null,
    title: "Absensi Harian 1A",
    scheduleType: "STANDALONE",
    activeDays: ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"],
    specificDate: null,
    startTime: new Date("1970-01-01T07:00:00.000Z"),
    endTime: new Date("1970-01-01T08:00:00.000Z"),
    isActive: true,
    notes: null,
    createdAt: new Date("2026-11-25T00:00:00.000Z"),
    updatedAt: new Date("2026-11-25T00:00:00.000Z"),
    deletedAt: null,
    academicYear: {
      id: "22222222-2222-4222-8222-222222222222",
      academic_year: "2026/2027",
      is_active: true,
      institution_id: "inst-1",
    },
    class: {
      id: "33333333-3333-4333-8333-333333333333",
      name: "1A",
      grade_level: 1,
      institution_id: "inst-1",
      academic_year_id: "22222222-2222-4222-8222-222222222222",
    },
    schedule: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceScheduleService,
        { provide: PrismaService, useValue: { client: mockPrismaClient } },
      ],
    }).compile();

    service = module.get<AttendanceScheduleService>(AttendanceScheduleService);
  });

  it("throws ForbiddenException when user has no institution profile", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue(null);
    await expect(
      service.findAll("user-1", { page: 1, limit: 20 }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("findAll returns paginated list with stats scoped to institution", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.attendanceSchedules.findMany.mockResolvedValue([
      mockScheduleRecord,
    ]);
    mockPrismaClient.attendanceSchedules.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1);

    const res = await service.findAll("user-1", {
      page: 1,
      limit: 10,
      isActive: "true",
    });

    expect(res.data).toHaveLength(1);
    expect(res.stats).toEqual({
      total: 1,
      active: 1,
      inactive: 0,
      standalone: 1,
    });
  });

  it("findOne throws NotFoundException when schedule does not exist", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.attendanceSchedules.findFirst.mockResolvedValue(null);

    await expect(service.findOne("user-1", "missing-id")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("create throws NotFoundException when academic year is missing", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.academicYears.findFirst.mockResolvedValue(null);
    mockPrismaClient.classes.findFirst.mockResolvedValue({
      id: "class-1",
      academic_year_id: "ay-1",
    });

    await expect(
      service.create("user-1", {
        academicYearId: "ay-1",
        classId: "class-1",
        title: "Test",
        scheduleType: "STANDALONE",
        activeDays: ["SENIN"],
        isActive: true,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("create throws BadRequestException when class does not belong to academicYearId", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.academicYears.findFirst.mockResolvedValue({ id: "ay-1" });
    mockPrismaClient.classes.findFirst.mockResolvedValue({
      id: "class-1",
      academic_year_id: "ay-other",
    });

    await expect(
      service.create("user-1", {
        academicYearId: "ay-1",
        classId: "class-1",
        title: "Test",
        scheduleType: "STANDALONE",
        activeDays: ["SENIN"],
        isActive: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("create throws NotFoundException when FROM_SCHEDULE scheduleId is not found in class", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.academicYears.findFirst.mockResolvedValue({ id: "ay-1" });
    mockPrismaClient.classes.findFirst.mockResolvedValue({
      id: "class-1",
      academic_year_id: "ay-1",
    });
    mockPrismaClient.schedule.findFirst.mockResolvedValue(null);

    await expect(
      service.create("user-1", {
        academicYearId: "ay-1",
        classId: "class-1",
        scheduleId: "sched-missing",
        title: "Matematika",
        scheduleType: "FROM_SCHEDULE",
        activeDays: ["SENIN"],
        isActive: true,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("create throws BadRequestException when endTime <= startTime", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.academicYears.findFirst.mockResolvedValue({ id: "ay-1" });
    mockPrismaClient.classes.findFirst.mockResolvedValue({
      id: "class-1",
      academic_year_id: "ay-1",
    });

    await expect(
      service.create("user-1", {
        academicYearId: "ay-1",
        classId: "class-1",
        title: "Test",
        scheduleType: "STANDALONE",
        activeDays: ["SENIN"],
        startTime: "09:00",
        endTime: "08:00",
        isActive: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("create succeeds for valid STANDALONE schedule", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.academicYears.findFirst.mockResolvedValue({
      id: mockScheduleRecord.academicYearId,
    });
    mockPrismaClient.classes.findFirst.mockResolvedValue({
      id: mockScheduleRecord.classId,
      academic_year_id: mockScheduleRecord.academicYearId,
    });
    mockPrismaClient.attendanceSchedules.create.mockResolvedValue(
      mockScheduleRecord,
    );

    const created = await service.create("user-1", {
      academicYearId: mockScheduleRecord.academicYearId,
      classId: mockScheduleRecord.classId,
      title: "  Absensi Harian 1A  ",
      scheduleType: "STANDALONE",
      activeDays: ["SENIN", "SELASA"],
      startTime: "07:00",
      endTime: "08:00",
      isActive: true,
    });

    expect(created).toEqual(mockScheduleRecord);
    expect(mockPrismaClient.attendanceSchedules.create).toHaveBeenCalledTimes(
      1,
    );
  });

  it("toggleStatus updates isActive when schedule exists", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.attendanceSchedules.findFirst.mockResolvedValue(
      mockScheduleRecord,
    );
    mockPrismaClient.attendanceSchedules.update.mockResolvedValue({
      ...mockScheduleRecord,
      isActive: false,
    });

    const result = await service.toggleStatus(
      "user-1",
      mockScheduleRecord.id,
      false,
    );
    expect(result.isActive).toBe(false);
  });

  it("updateDays updates activeDays when schedule exists", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.attendanceSchedules.findFirst.mockResolvedValue(
      mockScheduleRecord,
    );
    mockPrismaClient.attendanceSchedules.update.mockResolvedValue({
      ...mockScheduleRecord,
      activeDays: ["SENIN", "KAMIS"],
    });

    const result = await service.updateDays("user-1", mockScheduleRecord.id, [
      "SENIN",
      "KAMIS",
    ]);
    expect(result.activeDays).toEqual(["SENIN", "KAMIS"]);
  });

  it("remove soft deletes schedule when it exists", async () => {
    mockPrismaClient.profile.findFirst.mockResolvedValue({
      institutionId: "inst-1",
    });
    mockPrismaClient.attendanceSchedules.findFirst.mockResolvedValue(
      mockScheduleRecord,
    );
    mockPrismaClient.attendanceSchedules.update.mockResolvedValue({
      ...mockScheduleRecord,
      deletedAt: new Date(),
    });

    const result = await service.remove("user-1", mockScheduleRecord.id);
    expect(result.deletedAt).not.toBeNull();
  });
});
