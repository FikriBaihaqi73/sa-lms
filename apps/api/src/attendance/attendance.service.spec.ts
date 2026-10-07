import { ConflictException, NotFoundException } from "@nestjs/common";
import { AttendanceRepository } from "@repo/shared/infrastructure/repository/attendance.repository";
import { AttendanceStatusRepository } from "@repo/shared/infrastructure/repository/attendance-status.repository";
import { ScheduleRepository } from "@repo/shared/infrastructure/repository/schedule.repository";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
import type { CreateAttendanceDto } from "@repo/shared/schemas/attendance.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { AttendanceService } from "./attendance.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AttendanceService", () => {
  let service: AttendanceService;

  beforeEach(() => {
    service = new AttendanceService({} as PrismaService);
    jest
      .spyOn(ScheduleRepository.prototype, "findById")
      .mockResolvedValue({ id: "schedule-id" } as never);
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

  it("rejects duplicate attendance for the same schedule, student, and date", async () => {
    jest
      .spyOn(AttendanceRepository.prototype, "findByScheduleStudentAndDate")
      .mockResolvedValue({ id: "existing-id" } as never);

    await expect(
      service.create({
        schedule_id: "schedule-id",
        student_id: "student-id",
        attendance_status_id: "status-id",
        attendance_date: "2026-09-10T00:00:00.000Z",
      } as CreateAttendanceDto),
    ).rejects.toBeInstanceOf(ConflictException);
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

    await service.create({
      schedule_id: "schedule-id",
      student_id: "student-id",
      attendance_status_id: "status-id",
    } as CreateAttendanceDto);
    await service.update("attendance-id", { notes: "Present" });
    await expect(service.remove("attendance-id")).resolves.toEqual({
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
});
