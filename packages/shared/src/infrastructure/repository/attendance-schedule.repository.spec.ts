import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "#generated/client";
import { AttendanceScheduleRepository } from "./attendance-schedule.repository";

describe("AttendanceScheduleRepository", () => {
  const mockDelegate = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  const mockPrisma = {
    attendanceSchedules: mockDelegate,
  } as unknown as PrismaClient;

  let repository: AttendanceScheduleRepository;

  const mockEntity = {
    id: "11111111-1111-4111-8111-111111111111",
    academicYearId: "22222222-2222-4222-8222-222222222222",
    classId: "33333333-3333-4333-8333-333333333333",
    scheduleId: null,
    title: "Absensi Harian Kelas 1A",
    scheduleType: "STANDALONE",
    activeDays: ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"],
    specificDate: null,
    startTime: new Date("1970-01-01T07:00:00.000Z"),
    endTime: new Date("1970-01-01T08:00:00.000Z"),
    isActive: true,
    notes: "Absensi pagi",
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

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AttendanceScheduleRepository(mockPrisma);
  });

  it("findAll returns paginated data, meta, and stats scoped by institution", async () => {
    mockDelegate.findMany.mockResolvedValue([mockEntity]);
    mockDelegate.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    const result = await repository.findAll("inst-1", {
      academicYearId: "22222222-2222-4222-8222-222222222222",
      classId: "33333333-3333-4333-8333-333333333333",
      scheduleType: "STANDALONE",
      isActive: true,
      search: "Harian",
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      data: [mockEntity],
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
      stats: {
        total: 5,
        active: 4,
        inactive: 1,
        standalone: 2,
      },
    });

    expect(mockDelegate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        where: expect.objectContaining({
          deletedAt: null,
          academicYearId: "22222222-2222-4222-8222-222222222222",
          classId: "33333333-3333-4333-8333-333333333333",
          scheduleType: "STANDALONE",
          isActive: true,
          class: { institution_id: "inst-1", deleted_at: null },
        }),
      }),
    );
  });

  it("findById scopes query by institution and deletedAt null", async () => {
    mockDelegate.findFirst.mockResolvedValue(mockEntity);

    const result = await repository.findById("inst-1", mockEntity.id);
    expect(result).toEqual(mockEntity);
    expect(mockDelegate.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: mockEntity.id,
          deletedAt: null,
          class: { institution_id: "inst-1", deleted_at: null },
        },
      }),
    );
  });

  it("create stores a new attendance schedule record", async () => {
    mockDelegate.create.mockResolvedValue(mockEntity);

    const result = await repository.create({
      academicYearId: mockEntity.academicYearId,
      classId: mockEntity.classId,
      title: mockEntity.title,
      scheduleType: "STANDALONE",
      activeDays: ["SENIN", "SELASA"],
      isActive: true,
      notes: "Absensi pagi",
    });

    expect(result).toEqual(mockEntity);
    expect(mockDelegate.create).toHaveBeenCalledTimes(1);
  });

  it("update modifies specified fields only", async () => {
    const updated = { ...mockEntity, title: "Updated Title" };
    mockDelegate.update.mockResolvedValue(updated);

    const result = await repository.update(mockEntity.id, {
      title: "Updated Title",
    });

    expect(result.title).toBe("Updated Title");
    expect(mockDelegate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockEntity.id },
        data: { title: "Updated Title" },
      }),
    );
  });

  it("toggleActive updates isActive flag", async () => {
    mockDelegate.update.mockResolvedValue({ ...mockEntity, isActive: false });
    const result = await repository.toggleActive(mockEntity.id, false);
    expect(result.isActive).toBe(false);
    expect(mockDelegate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockEntity.id },
        data: { isActive: false },
      }),
    );
  });

  it("updateActiveDays updates activeDays array", async () => {
    const days = ["SENIN", "RABU", "JUMAT"];
    mockDelegate.update.mockResolvedValue({ ...mockEntity, activeDays: days });
    const result = await repository.updateActiveDays(mockEntity.id, days);
    expect(result.activeDays).toEqual(days);
    expect(mockDelegate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockEntity.id },
        data: { activeDays: days },
      }),
    );
  });

  it("softDelete sets deletedAt timestamp", async () => {
    mockDelegate.update.mockResolvedValue({
      ...mockEntity,
      deletedAt: new Date(),
    });
    await repository.softDelete(mockEntity.id);
    expect(mockDelegate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockEntity.id },
        data: { deletedAt: expect.any(Date) },
      }),
    );
  });
});
