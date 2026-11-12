import { ConflictException, NotFoundException } from "@nestjs/common";
import { AttendanceRepository } from "@repo/shared/infrastructure/repository/attendance.repository";
import { AttendanceStatusRepository } from "@repo/shared/infrastructure/repository/attendance-status.repository";
import { ScheduleRepository } from "@repo/shared/infrastructure/repository/schedule.repository";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
import type {
  BulkUpsertAttendanceDto,
  CreateAttendanceDto,
  UpsertAttendanceDto,
} from "@repo/shared/schemas/attendance.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { AttendanceService } from "./attendance.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AttendanceService", () => {
  let service: AttendanceService;
  let mockPrisma: PrismaService;

  beforeEach(() => {
    mockPrisma = {
      client: {
        profile: {
          findFirst: jest.fn().mockResolvedValue({ institutionId: "inst-1" }),
        },
        classStudent: {
          findMany: jest
            .fn()
            .mockResolvedValue([
              { studentId: "stud-1" },
              { studentId: "stud-2" },
            ]),
        },
      },
    } as unknown as PrismaService;

    service = new AttendanceService(mockPrisma);
    jest.spyOn(ScheduleRepository.prototype, "findById").mockResolvedValue({
      id: "schedule-id",
      classSubject: {
        class_id: "class-1",
        class: { institution_id: "inst-1" },
      },
    } as never);
    jest
      .spyOn(StudentRepository.prototype, "findById")
      .mockResolvedValue({ id: "student-id" } as never);
    jest
      .spyOn(AttendanceStatusRepository.prototype, "findById")
      .mockResolvedValue({ id: "status-id" } as never);
    jest
      .spyOn(AttendanceRepository.prototype, "findByScheduleStudentAndDate")
      .mockResolvedValue(null);
  });

  afterEach(() => jest.restoreAllMocks());

  it("rejects creation when a related schedule does not exist", async () => {
    jest
      .spyOn(ScheduleRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(
      service.create({} as CreateAttendanceDto),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects duplicate attendance for the same schedule, student, and date on manual create", async () => {
    jest
      .spyOn(AttendanceRepository.prototype, "findByScheduleStudentAndDate")
      .mockResolvedValue({ id: "existing-id" } as never);

    await expect(
      service.create(
        {
          schedule_id: "schedule-id",
          student_id: "student-id",
          attendance_status_id: "status-id",
          attendance_date: "2026-09-10T00:00:00.000Z",
        } as CreateAttendanceDto,
        "user-1",
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects a status or schedule from another institution", async () => {
    jest
      .spyOn(AttendanceStatusRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(
      service.create(
        {
          schedule_id: "schedule-id",
          student_id: "student-id",
          attendance_status_id: "foreign-status-id",
        } as CreateAttendanceDto,
        "user-1",
      ),
    ).rejects.toThrow("Attendance status not found");

    jest
      .spyOn(AttendanceStatusRepository.prototype, "findById")
      .mockResolvedValue({ id: "status-id" } as never);
    jest.spyOn(ScheduleRepository.prototype, "findById").mockResolvedValue({
      id: "schedule-id",
      classSubject: { class: { institution_id: "other-inst" } },
    } as never);

    await expect(
      service.create(
        {
          schedule_id: "schedule-id",
          student_id: "student-id",
          attendance_status_id: "status-id",
        } as CreateAttendanceDto,
        "user-1",
      ),
    ).rejects.toThrow("Schedule not found");
  });

  it("creates, updates, and soft-deletes an attendance record", async () => {
    const create = jest
      .spyOn(AttendanceRepository.prototype, "create")
      .mockResolvedValue({ id: "attendance-id" } as never);
    jest.spyOn(AttendanceRepository.prototype, "findById").mockResolvedValue({
      id: "attendance-id",
      schedule_id: "schedule-id",
      student_id: "student-id",
      attendance_status_id: "status-id",
      attendance_date: new Date("2026-09-10T00:00:00.000Z"),
    } as never);
    const update = jest
      .spyOn(AttendanceRepository.prototype, "update")
      .mockResolvedValue({ id: "attendance-id" } as never);
    const remove = jest
      .spyOn(AttendanceRepository.prototype, "delete")
      .mockResolvedValue({ id: "attendance-id" } as never);

    await service.create(
      {
        schedule_id: "schedule-id",
        student_id: "student-id",
        attendance_status_id: "status-id",
      } as CreateAttendanceDto,
      "user-1",
    );
    await service.update("attendance-id", { notes: "Present" }, "user-1");
    await expect(service.remove("attendance-id", "user-1")).resolves.toEqual({
      success: true,
      id: "attendance-id",
    });

    expect(create).toHaveBeenCalledWith({
      schedule_id: "schedule-id",
      student_id: "student-id",
      attendance_status_id: "status-id",
      attendance_date: undefined,
    });
    expect(update).toHaveBeenCalledWith("attendance-id", { notes: "Present" });
    expect(remove).toHaveBeenCalledWith("attendance-id");
  });

  it("upserts attendance cleanly without throwing duplicate error", async () => {
    const upsertSpy = jest
      .spyOn(AttendanceRepository.prototype, "upsert")
      .mockResolvedValue({ id: "att-1" } as never);

    const result = await service.upsert(
      {
        schedule_id: "schedule-id",
        student_id: "student-id",
        attendance_status_id: "status-id",
        attendance_date: "2026-11-10",
        notes: "Catatan inline",
      } as UpsertAttendanceDto,
      "user-1",
    );

    expect(result).toEqual({ id: "att-1" });
    expect(upsertSpy).toHaveBeenCalledWith({
      schedule_id: "schedule-id",
      student_id: "student-id",
      attendance_status_id: "status-id",
      attendance_date: new Date("2026-11-10T00:00:00.000Z"),
      notes: "Catatan inline",
    });
  });

  it("bulkUpsert marks attendance for auto-discovered class students", async () => {
    const bulkSpy = jest
      .spyOn(AttendanceRepository.prototype, "bulkUpsert")
      .mockResolvedValue([{ id: "att-1" }, { id: "att-2" }] as never);

    const results = await service.bulkUpsert(
      {
        schedule_id: "schedule-id",
        attendance_status_id: "status-id",
        attendance_date: "2026-11-10",
      } as BulkUpsertAttendanceDto,
      "user-1",
    );

    expect(results).toHaveLength(2);
    expect(bulkSpy).toHaveBeenCalledWith([
      {
        schedule_id: "schedule-id",
        student_id: "stud-1",
        attendance_status_id: "status-id",
        attendance_date: new Date("2026-11-10T00:00:00.000Z"),
        notes: null,
      },
      {
        schedule_id: "schedule-id",
        student_id: "stud-2",
        attendance_status_id: "status-id",
        attendance_date: new Date("2026-11-10T00:00:00.000Z"),
        notes: null,
      },
    ]);
  });

  it("scopes findAll and getSummary by institutionId", async () => {
    const findAllSpy = jest
      .spyOn(AttendanceRepository.prototype, "findAll")
      .mockResolvedValue({
        data: [],
        meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
      });
    const summarySpy = jest
      .spyOn(AttendanceRepository.prototype, "getSummary")
      .mockResolvedValue({
        total: 10,
        present: 8,
        permission: 1,
        sick: 1,
        absent: 0,
        attendanceRate: 80,
      });

    await service.findAll(1, 10, { search: "test" }, "user-1");
    expect(findAllSpy).toHaveBeenCalledWith(
      1,
      10,
      { search: "test" },
      "inst-1",
    );

    const summary = await service.getSummary({ search: "test" }, "user-1");
    expect(summarySpy).toHaveBeenCalledWith({ search: "test" }, "inst-1");
    expect(summary.total).toBe(10);
  });
});
