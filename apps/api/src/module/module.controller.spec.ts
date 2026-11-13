import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import { ROLES_KEY } from "../auth/roles.decorator";
import { LearningModuleController } from "./module.controller";
import { LearningModuleService } from "./module.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("LearningModuleController", () => {
  let controller: LearningModuleController;
  let service: LearningModuleService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningModuleController],
      providers: [
        {
          provide: LearningModuleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LearningModuleController>(LearningModuleController);
    service = module.get<LearningModuleService>(LearningModuleService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("Role Authorization", () => {
    it("is restricted strictly to admin role", () => {
      const reflector = new Reflector();
      const roles = reflector.get<string[]>(ROLES_KEY, LearningModuleController);
      expect(roles).toEqual(["admin"]);
    });
  });

  describe("Endpoints", () => {
    const mockModule = {
      id: "mod-1",
      title: "Modul 1: Algoritma Dasar",
      description: "Pengenalan algoritma pemrograman",
      class_subject_id: "cs-1",
      display_order: 1,
      is_published: true,
      is_locked: false,
      moduleContents: [],
      assignments: [],
      class_subject: { id: "cs-1", name: "Informatika" },
    };

    it("findAll forwards filters and returns paginated success", async () => {
      mockService.findAll.mockResolvedValue({
        data: [mockModule],
        meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
      });

      const result = await controller.findAll(
        "1",
        "10",
        "Algoritma",
        "cs-1",
        "true",
        "false",
      );

      expect(service.findAll).toHaveBeenCalledWith(1, 10, {
        search: "Algoritma",
        class_subject_id: "cs-1",
        is_published: true,
        is_locked: false,
      });
      expect(result).toEqual(
        ResponseHelper.success(
          [mockModule],
          "Learning modules retrieved successfully",
          200,
          { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
        ),
      );
    });

    it("findOne returns detail by id", async () => {
      mockService.findOne.mockResolvedValue(mockModule);

      const result = await controller.findOne("mod-1");

      expect(service.findOne).toHaveBeenCalledWith("mod-1");
      expect(result).toEqual(
        ResponseHelper.success(
          mockModule,
          "Learning module detail retrieved successfully",
        ),
      );
    });

    it("create calls service.create and returns 201", async () => {
      mockService.create.mockResolvedValue(mockModule);
      const dto = {
        title: "Modul 1: Algoritma Dasar",
        class_subject_id: "cs-1",
      };

      const result = await controller.create(dto as never);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ResponseHelper.success(
          mockModule,
          "Learning module created successfully",
          201,
        ),
      );
    });

    it("update calls service.update", async () => {
      const updated = { ...mockModule, title: "Updated Title" };
      mockService.update.mockResolvedValue(updated);
      const dto = { title: "Updated Title" };

      const result = await controller.update("mod-1", dto as never);

      expect(service.update).toHaveBeenCalledWith("mod-1", dto);
      expect(result).toEqual(
        ResponseHelper.success(
          updated,
          "Learning module updated successfully",
        ),
      );
    });

    it("remove calls service.remove", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "mod-1" });

      const result = await controller.remove("mod-1");

      expect(service.remove).toHaveBeenCalledWith("mod-1");
      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "mod-1" },
          "Learning module deleted successfully",
        ),
      );
    });
  });
});
