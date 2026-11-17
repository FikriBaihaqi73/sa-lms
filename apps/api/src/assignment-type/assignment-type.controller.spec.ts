import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import { ROLES_KEY } from "../auth/roles.decorator";
import { AssignmentTypeController } from "./assignment-type.controller";
import { AssignmentTypeService } from "./assignment-type.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AssignmentTypeController", () => {
  let controller: AssignmentTypeController;
  let service: AssignmentTypeService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentTypeController],
      providers: [
        {
          provide: AssignmentTypeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AssignmentTypeController>(AssignmentTypeController);
    service = module.get<AssignmentTypeService>(AssignmentTypeService);
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
        AssignmentTypeController,
      );

      expect(requiredRoles).toEqual(["admin"]);
      expect(requiredRoles).not.toContain("superadmin");
    });

    it("declares the same required roles on every handler", () => {
      const handlers = [
        AssignmentTypeController.prototype.findAll,
        AssignmentTypeController.prototype.findOne,
        AssignmentTypeController.prototype.create,
        AssignmentTypeController.prototype.update,
        AssignmentTypeController.prototype.remove,
      ];

      for (const handler of handlers) {
        const perHandler = reflector.get<string[]>(ROLES_KEY, handler);
        expect(perHandler).toBeUndefined();
      }
      expect(
        reflector.get<string[]>(ROLES_KEY, AssignmentTypeController),
      ).toEqual(["admin"]);
    });
  });

  describe("endpoints", () => {
    const mockRecord = {
      id: "at-1",
      name: "Tugas Mandiri",
      description: "Tugas individu di rumah",
    };

    it("findAll wraps the list", async () => {
      mockService.findAll.mockResolvedValue([mockRecord]);

      const result = await controller.findAll();

      expect(result).toEqual(
        ResponseHelper.success(
          [mockRecord],
          "Assignment types retrieved successfully",
        ),
      );
      expect(service.findAll).toHaveBeenCalled();
    });

    it("findOne wraps the detail", async () => {
      mockService.findOne.mockResolvedValue(mockRecord);

      const result = await controller.findOne("at-1");

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Assignment type detail retrieved successfully",
        ),
      );
      expect(service.findOne).toHaveBeenCalledWith("at-1");
    });

    it("create returns 201", async () => {
      mockService.create.mockResolvedValue(mockRecord);
      const dto = { name: "Tugas Kelompok" };

      const result = await controller.create(dto as never);

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Assignment type created successfully",
          201,
        ),
      );
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it("update forwards id and dto", async () => {
      mockService.update.mockResolvedValue(mockRecord);
      const dto = { name: "Tugas Praktikum" };

      const result = await controller.update("at-1", dto as never);

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Assignment type updated successfully",
        ),
      );
      expect(service.update).toHaveBeenCalledWith("at-1", dto);
    });

    it("remove forwards id", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "at-1" });

      const result = await controller.remove("at-1");

      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "at-1" },
          "Assignment type deleted successfully",
        ),
      );
      expect(service.remove).toHaveBeenCalledWith("at-1");
    });
  });
});
