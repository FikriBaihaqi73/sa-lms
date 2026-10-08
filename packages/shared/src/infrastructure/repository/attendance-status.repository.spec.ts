/// <reference types="jest" />
import type { PrismaClient } from "#generated/client";
import { AttendanceStatusRepository } from "vitest";

describe("AttendanceStatusRepository", () => {
  const attendanceStatuses = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const prisma = { attendanceStatuses } as unknown as PrismaClient;
  const repository = new AttendanceStatusRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a status and stores a missing description as null", async () => {
    const status = { id: "present-id", name: "Present", description: null };
    attendanceStatuses.create.mockResolvedValue(status);

    await expect(repository.create({ name: "Present" })).resolves.toEqual(
      status,
    );
    expect(attendanceStatuses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: "Present", description: null },
      }),
    );
  });

  it("only returns active statuses when finding one by ID or name", async () => {
    attendanceStatuses.findFirst.mockResolvedValue(null);

    await expect(repository.findById("missing-id")).resolves.toBeNull();
    await expect(repository.findByName("Absent")).resolves.toBeNull();

    expect(attendanceStatuses.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "missing-id", deleted_at: null },
      }),
    );
    expect(attendanceStatuses.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { name: "Absent", deleted_at: null } }),
    );
  });

  it("lists only active statuses", async () => {
    const statuses = [{ id: "present-id", name: "Present" }];
    attendanceStatuses.findMany.mockResolvedValue(statuses);
    attendanceStatuses.count.mockResolvedValue(statuses.length);

    await expect(repository.findAll()).resolves.toEqual({
      data: statuses,
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });
    expect(attendanceStatuses.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deleted_at: null } }),
    );
    expect(attendanceStatuses.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deleted_at: null } }),
    );
  });

  it("updates only the supplied fields", async () => {
    const status = { id: "late-id", name: "Late", description: null };
    attendanceStatuses.update.mockResolvedValue(status);

    await expect(
      repository.update("late-id", { name: "Late" }),
    ).resolves.toEqual(status);
    expect(attendanceStatuses.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "late-id" },
        data: { name: "Late" },
      }),
    );
  });

  it("soft-deletes a status", async () => {
    const status = { id: "absent-id", name: "Absent" };
    attendanceStatuses.update.mockResolvedValue(status);

    await expect(repository.delete("absent-id")).resolves.toEqual(status);
    expect(attendanceStatuses.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "absent-id" },
        data: { deleted_at: expect.any(Date) },
      }),
    );
  });
});
