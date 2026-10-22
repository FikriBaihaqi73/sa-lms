import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import { ROLES_KEY } from "../auth/roles.decorator";
import { SpecializationController } from "./specialization.controller";
import { SpecializationService } from "./specialization.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("SpecializationController", () => {
  let controller: SpecializationController;
  let service: SpecializationService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecializationController],
      providers: [
        {
          provide: SpecializationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SpecializationController>(SpecializationController);
    service = module.get<SpecializationService>(SpecializationService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("role authorization", () => {
    const reflector = new Reflector();

    it("restricts the controller to the admin role only", () => {
      const requiredRoles = reflector.get<string[]>(
        ROLES_KEY,
        SpecializationController,
      );

      expect(requiredRoles).toEqual(["admin"]);
      expect(requiredRoles).not.toContain("superadmin");
    });

    it("declares the same required roles on every handler", () => {
      const handlers = [
        SpecializationController.prototype.findAll,
        SpecializationController.prototype.findOne,
        SpecializationController.prototype.create,
        SpecializationController.prototype.update,
        SpecializationController.prototype.remove,
      ];

      for (const handler of handlers) {
        const perHandler = reflector.get<string[]>(ROLES_KEY, handler);
        expect(perHandler).toBeUndefined();
      }
      expect(
        reflector.get<string[]>(ROLES_KEY, SpecializationController),
      ).toEqual(["admin"]);
    });
  });

  describe("endpoints", () => {
    const mockRecord = {
      id: "spec-1",
      name: "Rekayasa Perangkat Lunak",
      description: "Fokus software engineering",
    };

    it("findAll wraps the list", async () => {
      mockService.findAll.mockResolvedValue([mockRecord]);

      const result = await controller.findAll();

      expect(result).toEqual(
        ResponseHelper.success(
          [mockRecord],
          "Specializations retrieved successfully",
        ),
      );
      expect(service.findAll).toHaveBeenCalled();
    });

    it("findOne wraps the detail", async () => {
      mockService.findOne.mockResolvedValue(mockRecord);

      const result = await controller.findOne("spec-1");

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Specialization detail retrieved successfully",
        ),
      );
      expect(service.findOne).toHaveBeenCalledWith("spec-1");
    });

    it("create returns 201", async () => {
      mockService.create.mockResolvedValue(mockRecord);
      const dto = { name: "Rekayasa Perangkat Lunak" };

      const result = await controller.create(dto as never);

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Specialization created successfully",
          201,
        ),
      );
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it("update forwards id and dto", async () => {
      mockService.update.mockResolvedValue(mockRecord);
      const dto = { name: "AI & Data Science" };

      const result = await controller.update("spec-1", dto as never);

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Specialization updated successfully",
        ),
      );
      expect(service.update).toHaveBeenCalledWith("spec-1", dto);
    });

    it("remove forwards id", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "spec-1" });

      const result = await controller.remove("spec-1");

      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "spec-1" },
          "Specialization deleted successfully",
        ),
      );
      expect(service.remove).toHaveBeenCalledWith("spec-1");
    });
  });
});