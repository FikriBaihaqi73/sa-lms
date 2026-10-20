import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import { ROLES_KEY } from "../auth/roles.decorator";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("ProfileController (0208 teacher-role lockdown)", () => {
  let controller: ProfileController;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: mockService }],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("role authorization", () => {
    const reflector = new Reflector();

    it("restricts the controller to superadmin and institution admin", () => {
      // POST /profiles carries an arbitrary roleId (including the teacher
      // role), so only admins may reach it. A student token is rejected by
      // the global RolesGuard with 403.
      const requiredRoles = reflector.get<string[]>(
        ROLES_KEY,
        ProfileController,
      );

      expect(requiredRoles).toEqual(["superadmin", "admin"]);
      expect(requiredRoles).not.toContain("teacher");
      expect(requiredRoles).not.toContain("student");
      expect(requiredRoles).not.toContain("guardian");
    });

    it("keeps self-service GET /profiles/me open to any authenticated user", () => {
      // Empty @Roles() on the handler overrides the class guard: the
      // RolesGuard allows requests without required roles, while the global
      // JwtAuthGuard still demands a valid token.
      expect(reflector.get<string[]>(ROLES_KEY, ProfileController)).toEqual([
        "superadmin",
        "admin",
      ]);
      expect(
        reflector.get<string[]>(
          ROLES_KEY,
          ProfileController.prototype.getMyProfile,
        ),
      ).toEqual([]);
    });

    it("keeps self-service PATCH /profiles/me open to any authenticated user", () => {
      expect(
        reflector.get<string[]>(
          ROLES_KEY,
          ProfileController.prototype.updateMyProfile,
        ),
      ).toEqual([]);
    });

    it("inherits admin-only roles on every privileged handler", () => {
      const privilegedHandlers = [
        ProfileController.prototype.findAll,
        ProfileController.prototype.findOne,
        ProfileController.prototype.create,
        ProfileController.prototype.update,
        ProfileController.prototype.remove,
      ];

      for (const handler of privilegedHandlers) {
        // No method-level override -> class-level @Roles applies.
        expect(reflector.get<string[]>(ROLES_KEY, handler)).toBeUndefined();
      }
    });
  });

  describe("endpoints", () => {
    it("create forwards the dto (admin path for teacher roleId)", async () => {
      const dto = {
        userId: "11111111-1111-1111-1111-111111111111",
        roleId: "22222222-2222-2222-2222-222222222222",
        institutionId: "33333333-3333-3333-3333-333333333333",
        fullName: "New Teacher",
      };
      mockService.create.mockResolvedValue({ id: "profile-1", ...dto });

      const result = await controller.create(dto as never);

      expect(result).toEqual(
        ResponseHelper.success(
          { id: "profile-1", ...dto },
          "Profile created successfully",
          201,
        ),
      );
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it("getMyProfile resolves the profile from the JWT subject", async () => {
      mockService.findByUserId.mockResolvedValue({ id: "profile-1" });

      const result = await controller.getMyProfile({ user: { sub: "user-1" } });

      expect(result).toEqual(
        ResponseHelper.success(
          { id: "profile-1" },
          "Current profile retrieved successfully",
        ),
      );
      expect(mockService.findByUserId).toHaveBeenCalledWith("user-1");
    });
  });
});
