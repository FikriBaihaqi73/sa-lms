import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { ProfileService } from "./profile.service";

const mockPrismaService = {
  client: {},
};

describe("ProfileService", () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);

    (service as any).profileRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of profiles", async () => {
      const mockResult = [{ id: "1" }];
      jest
        .spyOn((service as any).profileRepository, "findAll")
        .mockResolvedValue(mockResult);

      expect(await service.findAll()).toBe(mockResult);
    });
  });

  describe("findOne", () => {
    it("should return a profile if found", async () => {
      const mockResult = { id: "1" };
      jest
        .spyOn((service as any).profileRepository, "findById")
        .mockResolvedValue(mockResult);

      expect(await service.findOne("1")).toBe(mockResult);
    });

    it("should throw NotFoundException if not found", async () => {
      jest
        .spyOn((service as any).profileRepository, "findById")
        .mockResolvedValue(null);

      await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByUserId", () => {
    it("should return a profile if found by userId", async () => {
      const mockResult = { id: "1", userId: "user-1" };
      jest
        .spyOn((service as any).profileRepository, "findByUserId")
        .mockResolvedValue(mockResult);

      expect(await service.findByUserId("user-1")).toBe(mockResult);
    });
  });

  describe("create", () => {
    it("should create a profile", async () => {
      const mockDto: any = {
        userId: "1",
        institutionId: "1",
        fullName: "Test",
      };
      const mockResult = { id: "1", ...mockDto };
      jest
        .spyOn((service as any).profileRepository, "create")
        .mockResolvedValue(mockResult);

      expect(await service.create(mockDto)).toBe(mockResult);
    });
  });

  describe("update", () => {
    it("should update a profile", async () => {
      const mockDto: any = { fullName: "Updated" };
      const mockResult = { id: "1", fullName: "Updated" };
      jest.spyOn(service, "findOne").mockResolvedValue({ id: "1" } as any);
      jest
        .spyOn((service as any).profileRepository, "update")
        .mockResolvedValue(mockResult);

      expect(await service.update("1", mockDto)).toBe(mockResult);
    });
  });

  describe("remove", () => {
    it("should remove a profile", async () => {
      jest.spyOn(service, "findOne").mockResolvedValue({ id: "1" } as any);
      jest
        .spyOn((service as any).profileRepository, "delete")
        .mockResolvedValue({ id: "1" } as any);

      const result = await service.remove("1");
      expect(result).toEqual({ success: true, id: "1" });
    });
  });
});
