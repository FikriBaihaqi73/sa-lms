/// <reference types="jest" />

import type { PrismaClient } from "#generated/client";
import { AttendanceStatusRepository } from "./attendance-status.repository";

describe("AttendanceStatusRepository", () => {
  const attendanceStatuses = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  };
  const attendances = { count: jest.fn() };
  const prisma = { attendanceStatuses, attendances } as unknown as PrismaClient;
  const repository = new AttendanceStatusRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a status with its institution and null description", async () => {
    const status = { id: "present-id", institution_id: "inst-1" };
    attendanceStatuses.findFirst.mockResolvedValue(null);
    attendanceStatuses.create.mockResolvedValue(status);

    await expect(
      repository.create("inst-1", { name: "Present" }),
    ).resolves.toEqual(status);
    expect(attendanceStatuses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          institution_id: "inst-1",
          name: "Present",
          description: null,
          color: "#2563EB",
          icon: "check",
        },
      }),
    );
  });

  it("restores a soft-deleted status instead of inserting a duplicate", async () => {
    attendanceStatuses.findFirst.mockResolvedValue({
      id: "deleted-id",
      deleted_at: new Date(),
    });
    attendanceStatuses.update.mockResolvedValue({ id: "deleted-id" });

    await repository.create("inst-1", { name: "Present", description: "Back" });

    expect(attendanceStatuses.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "deleted-id" },
        data: { deleted_at: null, description: "Back" },
      }),
    );
    expect(attendanceStatuses.create).not.toHaveBeenCalled();
  });

  it("scopes lookups and lists to the institution", async () => {
    attendanceStatuses.findFirst.mockResolvedValue(null);
    attendanceStatuses.findMany.mockResolvedValue([]);
    attendanceStatuses.count.mockResolvedValue(0);

    await repository.findById("inst-1", "missing-id");
    await repository.findByName("inst-1", "Absent");
    await repository.findAll("inst-1");

    expect(attendanceStatuses.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "missing-id", institution_id: "inst-1", deleted_at: null },
      }),
    );
    expect(attendanceStatuses.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { institution_id: "inst-1", name: "Absent", deleted_at: null },
      }),
    );
    expect(attendanceStatuses.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { institution_id: "inst-1", deleted_at: null },
      }),
    );
  });

  it("counts only active attendance records for a scoped status", async () => {
    attendances.count.mockResolvedValue(3);

    await expect(repository.countUsage("inst-1", "status-id")).resolves.toBe(3);
    expect(attendances.count).toHaveBeenCalledWith({
      where: {
        attendance_status_id: "status-id",
        deleted_at: null,
        attendance_status: { institution_id: "inst-1" },
      },
    });
  });

  it("updates and soft-deletes only an active scoped row", async () => {
    attendanceStatuses.updateMany.mockResolvedValue({ count: 1 });
    attendanceStatuses.findFirst
      .mockResolvedValueOnce({ id: "status-id" })
      .mockResolvedValueOnce({ id: "status-id", deleted_at: new Date() });

    await repository.update("inst-1", "status-id", { name: "Late" });
    await repository.delete("inst-1", "status-id");

    expect(attendanceStatuses.updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "status-id", institution_id: "inst-1", deleted_at: null },
      }),
    );
    expect(attendanceStatuses.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "status-id", institution_id: "inst-1", deleted_at: null },
      }),
    );
  });

  it("creates and updates with custom color and icon", async () => {
    const status = {
      id: "status-custom",
      institution_id: "inst-1",
      name: "Sakit",
      color: "#DC2626",
      icon: "letter:S",
    };
    attendanceStatuses.findFirst.mockResolvedValue(null);
    attendanceStatuses.create.mockResolvedValue(status);

    await repository.create("inst-1", {
      name: "Sakit",
      color: "#DC2626",
      icon: "letter:S",
    });

    expect(attendanceStatuses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          color: "#DC2626",
          icon: "letter:S",
        }),
      }),
    );

    attendanceStatuses.updateMany.mockResolvedValue({ count: 1 });
    attendanceStatuses.findFirst.mockResolvedValueOnce(status);

    await repository.update("inst-1", "status-custom", {
      color: "#16A34A",
      icon: "check",
    });

    expect(attendanceStatuses.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          color: "#16A34A",
          icon: "check",
        }),
      }),
    );
  });
});
