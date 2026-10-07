import { NotFoundException } from "@nestjs/common";
import { SettingsRepository } from "@repo/shared/infrastructure/repository/settings.repository";
import type {
  CreateSettingDto,
  UpdateSettingDto,
} from "@repo/shared/schemas/setting.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { SettingsService } from "./settings.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("SettingsService", () => {
  let service: SettingsService;

  beforeEach(() => {
    service = new SettingsService({} as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a setting successfully", async () => {
    const mockCreated = {
      id: "setting-1",
      settingKey: "APP_NAME",
      settingValue: "NEXORA",
      description: "App Name",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      updater: null,
    };
    jest
      .spyOn(SettingsRepository.prototype, "create")
      .mockResolvedValue(mockCreated as never);

    const dto: CreateSettingDto = {
      settingKey: "APP_NAME",
      settingValue: "NEXORA",
      description: "App Name",
    };

    const result = await service.create(dto);
    expect(result).toEqual(mockCreated);
  });

  it("finds all settings with pagination", async () => {
    const mockData = {
      data: [{ id: "setting-1", settingKey: "APP_NAME" }],
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    };
    jest
      .spyOn(SettingsRepository.prototype, "findAll")
      .mockResolvedValue(mockData as never);

    const result = await service.findAll(1, 10, { search: "APP" });
    expect(result).toEqual(mockData);
  });

  it("returns a setting by id when found", async () => {
    const mockSetting = { id: "setting-1", settingKey: "APP_NAME" };
    jest
      .spyOn(SettingsRepository.prototype, "findById")
      .mockResolvedValue(mockSetting as never);

    const result = await service.findOne("setting-1");
    expect(result).toEqual(mockSetting);
  });

  it("throws NotFoundException when setting id is not found", async () => {
    jest
      .spyOn(SettingsRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("updates a setting when found", async () => {
    const mockSetting = { id: "setting-1", settingKey: "APP_NAME" };
    const mockUpdated = {
      id: "setting-1",
      settingKey: "APP_NAME",
      settingValue: "NEW VALUE",
    };

    jest
      .spyOn(SettingsRepository.prototype, "findById")
      .mockResolvedValue(mockSetting as never);
    jest
      .spyOn(SettingsRepository.prototype, "update")
      .mockResolvedValue(mockUpdated as never);

    const dto: UpdateSettingDto = {
      settingValue: "NEW VALUE",
    };

    const result = await service.update("setting-1", dto);
    expect(result).toEqual(mockUpdated);
  });

  it("throws NotFoundException when updating non-existent setting", async () => {
    jest
      .spyOn(SettingsRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(
      service.update("missing-id", { settingValue: "val" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("removes a setting when found", async () => {
    const mockSetting = { id: "setting-1", settingKey: "APP_NAME" };
    jest
      .spyOn(SettingsRepository.prototype, "findById")
      .mockResolvedValue(mockSetting as never);
    jest
      .spyOn(SettingsRepository.prototype, "delete")
      .mockResolvedValue(mockSetting as never);

    const result = await service.remove("setting-1");
    expect(result).toEqual({ success: true, id: "setting-1" });
  });

  it("throws NotFoundException when deleting non-existent setting", async () => {
    jest
      .spyOn(SettingsRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(service.remove("missing-id")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
