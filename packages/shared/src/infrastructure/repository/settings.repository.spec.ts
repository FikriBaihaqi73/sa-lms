/// <reference types="jest" />
import type { PrismaClient } from "#generated/client";
import { SettingsRepository } from "vitest";

describe("SettingsRepository", () => {
  const settings = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const prisma = { settings } as unknown as PrismaClient;
  const repository = new SettingsRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a setting successfully", async () => {
    const mockResult = {
      id: "setting-uuid-1",
      settingKey: "APP_NAME",
      settingValue: "NEXORA",
      description: "Platform Name",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    settings.create.mockResolvedValue(mockResult);

    const input = {
      settingKey: "APP_NAME",
      settingValue: "NEXORA",
      description: "Platform Name",
    };
    const result = await repository.create(input);

    expect(result).toEqual(mockResult);
    expect(settings.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          settingKey: "APP_NAME",
          settingValue: "NEXORA",
          description: "Platform Name",
        }),
      }),
    );
  });

  it("finds a setting by ID excluding deleted ones", async () => {
    const mockResult = {
      id: "setting-uuid-1",
      settingKey: "APP_NAME",
      settingValue: "NEXORA",
      deletedAt: null,
    };
    settings.findFirst.mockResolvedValue(mockResult);

    const result = await repository.findById("setting-uuid-1");
    expect(result).toEqual(mockResult);
    expect(settings.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "setting-uuid-1",
          deletedAt: null,
        },
      }),
    );
  });

  it("returns null when finding non-existent or deleted setting by ID", async () => {
    settings.findFirst.mockResolvedValue(null);

    const result = await repository.findById("non-existent-id");
    expect(result).toBeNull();
  });

  it("finds a setting by key excluding deleted ones", async () => {
    const mockResult = {
      id: "setting-uuid-1",
      settingKey: "MAINTENANCE_MODE",
      settingValue: "false",
      deletedAt: null,
    };
    settings.findFirst.mockResolvedValue(mockResult);

    const result = await repository.findByKey("MAINTENANCE_MODE");
    expect(result).toEqual(mockResult);
    expect(settings.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          settingKey: "MAINTENANCE_MODE",
          deletedAt: null,
        },
      }),
    );
  });

  it("finds all settings with pagination and optional search", async () => {
    const mockList = [
      {
        id: "setting-uuid-1",
        settingKey: "APP_NAME",
        settingValue: "NEXORA",
        deletedAt: null,
      },
    ];
    settings.findMany.mockResolvedValue(mockList);
    settings.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10, { search: "APP" });

    expect(result.data).toEqual(mockList);
    expect(result.meta).toEqual({
      currentPage: 1,
      perPage: 10,
      totalData: 1,
      totalPages: 1,
    });
    expect(settings.findMany).toHaveBeenCalled();
    expect(settings.count).toHaveBeenCalled();
  });

  it("updates setting fields properly", async () => {
    const mockUpdated = {
      id: "setting-uuid-1",
      settingKey: "APP_NAME",
      settingValue: "NEXORA PRO",
      description: "Updated Description",
    };
    settings.update.mockResolvedValue(mockUpdated);

    const result = await repository.update("setting-uuid-1", {
      settingValue: "NEXORA PRO",
      description: "Updated Description",
    });

    expect(result).toEqual(mockUpdated);
    expect(settings.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "setting-uuid-1" },
        data: expect.objectContaining({
          settingValue: "NEXORA PRO",
          description: "Updated Description",
        }),
      }),
    );
  });

  it("soft deletes a setting by setting deletedAt", async () => {
    const mockDeleted = {
      id: "setting-uuid-1",
      deletedAt: new Date(),
    };
    settings.update.mockResolvedValue(mockDeleted);

    const result = await repository.delete("setting-uuid-1");
    expect(result).toEqual(mockDeleted);
    expect(settings.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "setting-uuid-1" },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      }),
    );
  });
});
