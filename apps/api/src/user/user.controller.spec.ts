import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import type { Request } from "express";
import { ROLES_KEY } from "../auth/roles.decorator";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("UserController", () => {
  let controller: UserController;
  let service: UserService;

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
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("role authorization", () => {
    const reflector = new Reflector();

    it("restricts the controller to superadmin and institution admin", () => {
      const requiredRoles = reflector.get<string[]>(
        ROLES_KEY,
        UserController,
      );

      expect(requiredRoles).toEqual(["superadmin", "admin"]);
    });

    it("does not expose the controller to other roles", () => {
      const requiredRoles = reflector.get<string[]>(
        ROLES_KEY,
        UserController,
      );

      expect(requiredRoles).not.toContain("teacher");
      expect(requiredRoles).not.toContain("student");
      expect(requiredRoles).not.toContain("guardian");
    });

    it("inherits the same required roles on every handler", () => {
      const handlers = [
        UserController.prototype.findAll,
        UserController.prototype.findOne,
        UserController.prototype.create,
        UserController.prototype.update,
        UserController.prototype.remove,
      ];

      for (const handler of handlers) {
        // Inherited from the class-level decorator when not overridden.
        const perHandler = reflector.get<string[]>(ROLES_KEY, handler);
        expect(perHandler).toBeUndefined();
      }
      expect(reflector.get<string[]>(ROLES_KEY, UserController)).toEqual([
        "superadmin",
        "admin",
      ]);
    });
  });

  describe("endpoints", () => {
    const mockUser = {
      id: "user-1",
      email: "user@example.com",
      is_active: true,
    };
    const mockList = {
      data: [mockUser],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    it("findAll forwards pagination, search and the authenticated user id", async () => {
      mockService.findAll.mockResolvedValue(mockList);

      const result = await controller.findAll(asAdminRequest(), 2, 20, "ahmad");

      expect(result).toEqual(
        ResponseHelper.success(mockList, "Users retrieved successfully"),
      );
      expect(service.findAll).toHaveBeenCalledWith(2, 20, "ahmad", ADMIN_USER_ID);
    });

    it("findOne forwards id and the authenticated user id", async () => {
      mockService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne("user-1", asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(mockUser, "User detail retrieved successfully"),
      );
      expect(service.findOne).toHaveBeenCalledWith("user-1", ADMIN_USER_ID);
    });

    it("create returns 201 and forwards the dto plus authenticated user id", async () => {
      mockService.create.mockResolvedValue(mockUser);
      const dto = { email: "user@example.com", password: "password123" };

      const result = await controller.create(dto as never, asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(mockUser, "User created successfully", 201),
      );
      expect(service.create).toHaveBeenCalledWith(dto, ADMIN_USER_ID);
    });

    it("update forwards id, dto and the authenticated user id", async () => {
      mockService.update.mockResolvedValue(mockUser);
      const dto = { is_active: false };

      const result = await controller.update(
        "user-1",
        dto as never,
        asAdminRequest(),
      );

      expect(result).toEqual(
        ResponseHelper.success(mockUser, "User updated successfully"),
      );
      expect(service.update).toHaveBeenCalledWith("user-1", dto, ADMIN_USER_ID);
    });

    it("remove forwards id and the authenticated user id", async () => {
      mockService.remove.mockResolvedValue({ success: true, id: "user-1" });

      const result = await controller.remove("user-1", asAdminRequest());

      expect(result).toEqual(
        ResponseHelper.success(
          { success: true, id: "user-1" },
          "User deleted successfully",
        ),
      );
      expect(service.remove).toHaveBeenCalledWith("user-1", ADMIN_USER_ID);
    });

    it("never accepts an institution id from the request payload", async () => {
      mockService.findAll.mockResolvedValue(mockList);
      // A client attempting to smuggle a foreign institution id in the body or
      // query cannot influence the scope: only `request.user.sub` is forwarded.
      const request = asAdminRequest();
      (request as unknown as { body?: unknown }).body = {
        institutionId: "bbbbbbbb-0000-0000-0000-000000000002",
      };

      await controller.findAll(request);

      expect(service.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        ADMIN_USER_ID,
      );
    });
  });
});
