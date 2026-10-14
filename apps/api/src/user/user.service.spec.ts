import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { UserRepository } from "@repo/shared/infrastructure/repository/user.repository";
import type {
  CreateUserDto,
  UpdateUserDto,
} from "@repo/shared/schemas/user.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { UserService } from "./user.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const SUPERADMIN_USER_ID = "00000000-0000-0000-0000-000000000000";
const ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";
const INSTITUTION_A = "aaaaaaaa-0000-0000-0000-000000000001";
const INSTITUTION_B = "bbbbbbbb-0000-0000-0000-000000000002";

interface PrismaClientStub {
  profile: { findFirst: jest.Mock };
}

describe("UserService", () => {
  let service: UserService;
  let profileFindFirst: jest.Mock;

  beforeEach(() => {
    profileFindFirst = jest.fn();
    service = new UserService({
      client: { profile: { findFirst: profileFindFirst } } as PrismaClientStub,
    } as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Simulate the authenticated caller's trusted profile. `role` drives the
   * scope: superadmin reaches every institution, any other role is limited to
   * `institutionId`. A `null` profile means the caller has no institution.
   */
  const mockCaller = (
    role: string | null,
    institutionId: string | null = INSTITUTION_A,
  ) => {
    profileFindFirst.mockResolvedValue(
      role === null || institutionId === null
        ? null
        : { institutionId, role: { name: role } },
    );
  };

  describe("caller scope resolution", () => {
    it("rejects every operation when the caller has no profile", async () => {
      mockCaller(null);

      await expect(
        service.findAll(1, 10, undefined, ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.findOne("user-id", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.create(
          {
            email: "new@example.com",
            password: "password123",
          } as CreateUserDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.update(
          "user-id",
          { is_active: true } as UpdateUserDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.remove("user-id", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("derives the scope from the authenticated user id only", async () => {
      mockCaller("admin", INSTITUTION_A);
      jest
        .spyOn(UserRepository.prototype, "findAll")
        .mockResolvedValue({ data: [], meta: {} } as never);

      await service.findAll(1, 10, undefined, ADMIN_USER_ID);

      expect(profileFindFirst).toHaveBeenCalledWith({
        where: { userId: ADMIN_USER_ID, deletedAt: null },
        select: { institutionId: true, role: { select: { name: true } } },
      });
    });
  });

  describe("findAll", () => {
    it("scopes an institution admin to their own institution", async () => {
      mockCaller("admin", INSTITUTION_A);
      const findAll = jest
        .spyOn(UserRepository.prototype, "findAll")
        .mockResolvedValue({ data: [], meta: {} } as never);

      await service.findAll(1, 10, undefined, ADMIN_USER_ID);

      expect(findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        institution_id: INSTITUTION_A,
      });
    });

    it("uses a different institution scope for a different admin", async () => {
      mockCaller("admin", INSTITUTION_B);
      const findAll = jest
        .spyOn(UserRepository.prototype, "findAll")
        .mockResolvedValue({ data: [], meta: {} } as never);

      await service.findAll(1, 10, undefined, ADMIN_USER_ID);

      expect(findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        institution_id: INSTITUTION_B,
      });
    });

    it("does not scope superadmin to any institution", async () => {
      mockCaller("superadmin", INSTITUTION_A);
      const findAll = jest
        .spyOn(UserRepository.prototype, "findAll")
        .mockResolvedValue({ data: [], meta: {} } as never);

      await service.findAll(1, 10, undefined, SUPERADMIN_USER_ID);

      expect(findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it("keeps search while scoping to the caller's institution", async () => {
      mockCaller("admin", INSTITUTION_A);
      const findAll = jest
        .spyOn(UserRepository.prototype, "findAll")
        .mockResolvedValue({ data: [], meta: {} } as never);

      await service.findAll(2, 20, "ahmad", ADMIN_USER_ID);

      expect(findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        search: "ahmad",
        institution_id: INSTITUTION_A,
      });
    });
  });

  describe("findOne", () => {
    it("returns a user within the admin's institution", async () => {
      mockCaller("admin", INSTITUTION_A);
      const findById = jest
        .spyOn(UserRepository.prototype, "findById")
        .mockResolvedValue({ id: "user-id" } as never);

      const result = await service.findOne("user-id", ADMIN_USER_ID);

      expect(findById).toHaveBeenCalledWith("user-id", INSTITUTION_A);
      expect(result).toEqual({ id: "user-id" });
    });

    it("rejects a user owned by another institution", async () => {
      mockCaller("admin", INSTITUTION_A);
      const findById = jest
        .spyOn(UserRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.findOne("foreign-user", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(findById).toHaveBeenCalledWith("foreign-user", INSTITUTION_A);
    });

    it("lets superadmin read a user without an institution filter", async () => {
      mockCaller("superadmin", INSTITUTION_A);
      const findById = jest
        .spyOn(UserRepository.prototype, "findById")
        .mockResolvedValue({ id: "user-id" } as never);

      await service.findOne("user-id", SUPERADMIN_USER_ID);

      expect(findById).toHaveBeenCalledWith("user-id", undefined);
    });
  });

  describe("create", () => {
    it("rejects duplicate emails", async () => {
      mockCaller("admin", INSTITUTION_A);
      jest
        .spyOn(UserRepository.prototype, "findByEmail")
        .mockResolvedValue({ id: "existing-id" } as never);

      await expect(
        service.create(
          {
            email: "used@example.com",
            password: "password123",
          } as CreateUserDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it("hashes the password before creating a user", async () => {
      mockCaller("admin", INSTITUTION_A);
      jest.spyOn(UserRepository.prototype, "findByEmail").mockResolvedValue(null);
      const create = jest
        .spyOn(UserRepository.prototype, "create")
        .mockResolvedValue({ id: "user-id" } as never);

      await service.create(
        {
          email: "USER@EXAMPLE.COM",
          password: "password123",
        } as CreateUserDto,
        ADMIN_USER_ID,
      );

      expect(create).toHaveBeenCalledWith({
        email: "user@example.com",
        password: expect.not.stringMatching(/^password123$/),
      });
    });

    it("never grants superadmin or another institution through the request", async () => {
      mockCaller("admin", INSTITUTION_A);
      jest.spyOn(UserRepository.prototype, "findByEmail").mockResolvedValue(null);
      const create = jest
        .spyOn(UserRepository.prototype, "create")
        .mockResolvedValue({ id: "user-id" } as never);

      // A caller cannot smuggle a role/institution into the created user: the
      // repository only ever receives email, password and is_active.
      await service.create(
        {
          email: "new@example.com",
          password: "password123",
          role: "superadmin",
          institutionId: INSTITUTION_B,
        } as unknown as CreateUserDto,
        ADMIN_USER_ID,
      );

      expect(create).toHaveBeenCalledWith({
        email: "new@example.com",
        password: expect.any(String),
      });
    });
  });

  describe("update and remove", () => {
    it("updates a user and soft-deletes it within the caller's institution", async () => {
      mockCaller("admin", INSTITUTION_A);
      jest
        .spyOn(UserRepository.prototype, "findById")
        .mockResolvedValue({ id: "user-id" } as never);
      const update = jest
        .spyOn(UserRepository.prototype, "update")
        .mockResolvedValue({ id: "user-id" } as never);
      const remove = jest
        .spyOn(UserRepository.prototype, "delete")
        .mockResolvedValue({ id: "user-id" } as never);

      await service.update(
        "user-id",
        { is_active: false } as UpdateUserDto,
        ADMIN_USER_ID,
      );
      await expect(service.remove("user-id", ADMIN_USER_ID)).resolves.toEqual({
        success: true,
        id: "user-id",
      });
      expect(update).toHaveBeenCalledWith("user-id", { is_active: false });
      expect(remove).toHaveBeenCalledWith("user-id");
    });

    it("rejects updating a user owned by another institution", async () => {
      mockCaller("admin", INSTITUTION_A);
      jest.spyOn(UserRepository.prototype, "findById").mockResolvedValue(null);
      const update = jest.spyOn(UserRepository.prototype, "update");

      await expect(
        service.update(
          "foreign-user",
          { is_active: false } as UpdateUserDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(update).not.toHaveBeenCalled();
    });

    it("rejects deleting a user owned by another institution", async () => {
      mockCaller("admin", INSTITUTION_A);
      jest.spyOn(UserRepository.prototype, "findById").mockResolvedValue(null);
      const remove = jest.spyOn(UserRepository.prototype, "delete");

      await expect(
        service.remove("foreign-user", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
