import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import type { Request } from "express";
import { ROLES_KEY } from "../auth/roles.decorator";
import { AcademicYearController } from "./academic-year.controller";
import { AcademicYearService } from "./academic-year.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("AcademicYearController", () => {
  let controller: AcademicYearController;
  let service: AcademicYearService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  /** Mirror what JwtAuthGuard attaches to the express request. */
  const asAdminRequest = (): Request & { user: { sub: string } } =>
    ({ user: { sub: ADMIN_USER_ID } }) as unknown as Request & {
      user: { sub: string };
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicYearController],
      providers: [
        {
          provide: AcademicYearService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AcademicYearController>(AcademicYearController);
    service = module.get<AcademicYearService>(AcademicYearService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("role authorization", () => {
    const reflector = new Reflector();

    it("restricts the controller to the admin role only", () => {
      // @Roles("admin") on the class means Superadmin, teacher, student and
      // guardian tokens are rejected by the global RolesGuard with 403.
      const requiredRoles = reflector.get<string[]>(
        ROLES_KEY,
        AcademicYearController,
      );

      expect(requiredRoles).toEqual(["admin"]);
      expect(requiredRoles).not.toContain("superadmin");
    });

    it("declares the same required roles on every handler", () => {
      const handlers = [
        AcademicYearController.prototype.findAll,
        AcademicYearController.prototype.findOne,
        AcademicYearController.prototype.create,
        AcademicYearController.prototype.update,
        AcademicYearController.prototype.remove,
      ];

      for (const handler of handlers) {
        // Inherited from the class-level decorator when not overridden.
        const perHandler = reflector.get<string[]>(ROLES_KEY, handler);
        expect(perHandler).toBeUndefined();
      }
      expect(
        reflector.get<string[]>(ROLES_KEY, AcademicYearController),
      ).toEqual(["admin"]);
    });
  });

  describe("endpoints", () => {
    const mockRecord = {
      id: "ay-1",
      academic_year: "2026/2027",
      is_active: true,
      institution_id: "aaaaaaaa-0000-0000-0000-000000000001",
    };

    it("findAll wraps the list and forwards the authenticated user id", async () => {
      mockService.findAll.mockResolvedValue([mockRecord]);

      const result = await controller.findAll(asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          [mockRecord],
          "Academic years retrieved successfully",
        ),
      );
      expect(service.findAll).toHaveBeenCalledWith(ADMIN_USER_ID);
    });

    it("findOne wraps the detail and forwards id plus authenticated user id", async () => {
      mockService.findOne.mockResolvedValue(mockRecord);

      const result = await controller.findOne("ay-1", asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Academic year detail retrieved successfully",
        ),
      );
      expect(service.findOne).toHaveBeenCalledWith("ay-1", ADMIN_USER_ID);
    });

    it("create returns 201 and forwards the dto plus authenticated user id", async () => {
      mockService.create.mockResolvedValue(mockRecord);
      const dto = { academic_year: "2026/2027", is_active: true };

      const result = await controller.create(dto as never, asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Academic year created successfully",
          201,
        ),
      );
      expect(service.create).toHaveBeenCalledWith(dto, ADMIN_USER_ID);
    });

    it("update forwards id, dto and the authenticated user id", async () => {
      mockService.update.mockResolvedValue(mockRecord);
      const dto = { is_active: false };

      const result = await controller.update(
        "ay-1",
        dto as never,
        asAdminRequest(),
      );

      expect(result).toEqual(
        ResponseHelper.success(
          mockRecord,
          "Academic year updated successfully",
        ),
      );
      expect(service.update).toHaveBeenCalledWith("ay-1", dto, ADMIN_USER_ID);
    });

    it("remove forwards id and the authenticated user id", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "ay-1" });

      const result = await controller.remove("ay-1", asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "ay-1" },
          "Academic year deleted successfully",
        ),
      );
      expect(service.remove).toHaveBeenCalledWith("ay-1", ADMIN_USER_ID);
    });

    it("never accepts an institution id from the request payload", async () => {
      mockService.findAll.mockResolvedValue([]);
      // A client attempting to smuggle a foreign institution id in the body or
      // query cannot influence the scope: only `request.user.sub` is forwarded.
      const request = asAdminRequest();
      (request as unknown as { body?: unknown }).body = {
        institution_id: "bbbbbbbb-0000-0000-0000-000000000002",
      };

      await controller.findAll(request);

      expect(service.findAll).toHaveBeenCalledWith(ADMIN_USER_ID);
    });
  });
});
