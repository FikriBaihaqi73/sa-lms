/// <reference types="jest" />

import type { PrismaClient } from "#generated/client";
import { AttendanceRepository } from "./attendance.repository";

describe("AttendanceRepository", () => {
  const attendances = {
    create: jest.fn(),
    upsert: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };
  const $transaction = jest.fn();
  const prisma = {
    attendances,
    $transaction,
  } as unknown as PrismaClient;

  const repository = new AttendanceRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an attendance record", async () => {
    const mockResult = { id: "att-1", schedule_id: "sch-1" };
    attendances.create.mockResolvedValue(mockResult);

    const result = await repository.create({
      schedule_id: "sch-1",
      student_id: "stud-1",
      attendance_status_id: "stat-1",
      attendance_date: new Date("2026-11-10T00:00:00.000Z"),
      notes: "Hadir",
    });

    expect(result).toEqual(mockResult);
    expect(attendances.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          schedule_id: "sch-1",
          student_id: "stud-1",
          attendance_status_id: "stat-1",
          notes: "Hadir",
        }),
      }),
    );
  });

  it("upserts an attendance record using the compound unique constraint", async () => {
    const mockResult = { id: "att-1", schedule_id: "sch-1" };
    attendances.upsert.mockResolvedValue(mockResult);

    const date = new Date("2026-11-10T00:00:00.000Z");
    const result = await repository.upsert({
      schedule_id: "sch-1",
      student_id: "stud-1",
      attendance_status_id: "stat-1",
      attendance_date: date,
      notes: "Catatan test",
    });

    expect(result).toEqual(mockResult);
    expect(attendances.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          schedule_id_student_id_attendance_date: {
            schedule_id: "sch-1",
            student_id: "stud-1",
            attendance_date: date,
          },
        },
        create: expect.objectContaining({
          schedule_id: "sch-1",
          student_id: "stud-1",
          attendance_status_id: "stat-1",
          notes: "Catatan test",
        }),
        update: expect.objectContaining({
          attendance_status_id: "stat-1",
          notes: "Catatan test",
          deleted_at: null,
        }),
      }),
    );
  });

  it("performs bulkUpsert via prisma.$transaction", async () => {
    const date = new Date("2026-11-10T00:00:00.000Z");
    const records = [
      {
        schedule_id: "sch-1",
        student_id: "stud-1",
        attendance_status_id: "stat-1",
        attendance_date: date,
      },
      {
        schedule_id: "sch-1",
        student_id: "stud-2",
        attendance_status_id: "stat-1",
        attendance_date: date,
      },
    ];

    $transaction.mockResolvedValue([{ id: "att-1" }, { id: "att-2" }]);

    const results = await repository.bulkUpsert(records);
    expect(results).toHaveLength(2);
    expect($transaction).toHaveBeenCalled();
  });

  it("filters attendances by date range (start_date and end_date)", async () => {
    attendances.findMany.mockResolvedValue([]);
    attendances.count.mockResolvedValue(0);

    await repository.findAll(
      1,
      10,
      {
        start_date: "2026-11-01",
        end_date: "2026-11-30",
        class_id: "class-1",
      },
      "inst-1",
    );

    expect(attendances.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          attendance_date: {
            gte: new Date("2026-11-01T00:00:00.000Z"),
            lte: new Date("2026-11-30T23:59:59.999Z"),
          },
        }),
      }),
    );
  });

  it("filters attendances by month and year", async () => {
    attendances.findMany.mockResolvedValue([]);
    attendances.count.mockResolvedValue(0);

    await repository.findAll(
      1,
      50,
      {
        month: 11,
        year: 2026,
      },
      "inst-1",
    );

    expect(attendances.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          attendance_date: {
            gte: new Date(Date.UTC(2026, 10, 1, 0, 0, 0)),
            lte: new Date(Date.UTC(2026, 11, 0, 23, 59, 59, 999)),
          },
        }),
      }),
    );
  });

  it("calculates summary statistics accurately", async () => {
    attendances.findMany.mockResolvedValue([
      { attendance_status: { name: "Hadir" } },
      { attendance_status: { name: "Hadir" } },
      { attendance_status: { name: "Izin" } },
      { attendance_status: { name: "Sakit" } },
      { attendance_status: { name: "Alpa" } },
    ]);

    const summary = await repository.getSummary(
      { schedule_id: "sch-1" },
      "inst-1",
    );

    expect(summary).toEqual({
      total: 5,
      present: 2,
      permission: 1,
      sick: 1,
      absent: 1,
      attendanceRate: 40,
    });
  });

  it("updates and soft-deletes attendance", async () => {
    attendances.update.mockResolvedValue({ id: "att-1" });

    await repository.update("att-1", { notes: "Diperbarui" });
    expect(attendances.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "att-1" },
        data: expect.objectContaining({ notes: "Diperbarui" }),
      }),
    );

    await repository.delete("att-1");
    expect(attendances.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "att-1" },
        data: expect.objectContaining({ deleted_at: expect.any(Date) }),
      }),
    );
  });
});
