import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import { ROLES_KEY } from "../auth/roles.decorator";
import { ModuleContentController } from "./module-content.controller";
import { ModuleContentService } from "./module-content.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("ModuleContentController", () => {
  let controller: ModuleContentController;
  let service: ModuleContentService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuleContentController],
      providers: [
        {
          provide: ModuleContentService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ModuleContentController>(ModuleContentController);
    service = module.get<ModuleContentService>(ModuleContentService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("Role Authorization", () => {
    it("is restricted strictly to admin role", () => {
      const reflector = new Reflector();
      const roles = reflector.get<string[]>(ROLES_KEY, ModuleContentController);
      expect(roles).toEqual(["admin"]);
    });
  });

  describe("Endpoints", () => {
    const mockContent = {
      id: "mc-1",
      moduleId: "mod-1",
      title: "Slide Presentasi Bab 1",
      contentType: "pdf",
      content: "https://example.com/slide.pdf",
      fileId: null,
      sortOrder: 1,
    };

    it("findAll forwards filters and returns paginated success", async () => {
      mockService.findAll.mockResolvedValue({
        data: [mockContent],
        meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
      });

      const result = await controller.findAll(
        "1",
        "10",
        "Slide",
        "mod-1",
        "pdf",
      );

      expect(service.findAll).toHaveBeenCalledWith(1, 10, {
        search: "Slide",
        moduleId: "mod-1",
        contentType: "pdf",
      });
      expect(result).toEqual(
        ResponseHelper.success(
          [mockContent],
          "Module contents retrieved successfully",
          200,
          { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
        ),
      );
    });

    it("findOne returns detail by id", async () => {
      mockService.findOne.mockResolvedValue(mockContent);

      const result = await controller.findOne("mc-1");

      expect(service.findOne).toHaveBeenCalledWith("mc-1");
      expect(result).toEqual(
        ResponseHelper.success(
          mockContent,
          "Module content detail retrieved successfully",
        ),
      );
    });

    it("create calls service.create and returns 201", async () => {
      mockService.create.mockResolvedValue(mockContent);
      const dto = {
        moduleId: "mod-1",
        title: "Slide Presentasi Bab 1",
        contentType: "pdf",
      };

      const result = await controller.create(dto as never);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ResponseHelper.success(
          mockContent,
          "Module content created successfully",
          201,
        ),
      );
    });

    it("update calls service.update", async () => {
      const updated = { ...mockContent, title: "Updated Slide Title" };
      mockService.update.mockResolvedValue(updated);
      const dto = { title: "Updated Slide Title" };

      const result = await controller.update("mc-1", dto as never);

      expect(service.update).toHaveBeenCalledWith("mc-1", dto);
      expect(result).toEqual(
        ResponseHelper.success(
          updated,
          "Module content updated successfully",
        ),
      );
    });

    it("remove calls service.remove", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "mc-1" });

      const result = await controller.remove("mc-1");

      expect(service.remove).toHaveBeenCalledWith("mc-1");
      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "mc-1" },
          "Module content deleted successfully",
        ),
      );
    });
  });
});
