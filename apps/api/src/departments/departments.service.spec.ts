import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { DepartmentRepository } from "@repo/shared/infrastructure/repository/departments.repository";
import type { PrismaService } from "../prisma/prisma.service";
import { DepartmentsService } from "./departments.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {
      profile: {
        findFirst: jest.fn(),
      },
    };
  },
}));

describe("DepartmentsService", () => {
  let service: DepartmentsService;
  let prismaMock: { client: { profile: { findFirst: jest.Mock } } };

  beforeEach(() => {
    prismaMock = {
      client: {
        profile: {
          findFirst: jest.fn(),
        },
      },
    };
    service = new DepartmentsService(prismaMock as unknown as PrismaService);
  });

  afterEach(() => jest.restoreAllMocks());

  it("resolves institutionId from user profile", async () => {
    prismaMock.client.profile.findFirst.mockResolvedValue({
      institutionId: "inst-123",
    });

    const instId = await service.institutionIdFor("user-1");
    expect(instId).toBe("inst-123");
  });

  it("throws ForbiddenException when user has no institution profile", async () => {
    prismaMock.client.profile.findFirst.mockResolvedValue(null);

    await expect(service.institutionIdFor("user-none")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("forwards the search filter and institutionId when retrieving departments", async () => {
    prismaMock.client.profile.findFirst.mockResolvedValue({
      institutionId: "inst-123",
    });
    const findAll = jest
      .spyOn(DepartmentRepository.prototype, "findAll")
      .mockResolvedValue({
        data: [],
        meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
      });

    await service.findAll(1, 10, { search: "science" }, "user-1");

    expect(findAll).toHaveBeenCalledWith(1, 10, {
      search: "science",
      institution_id: "inst-123",
    });
  });

  it("throws NotFoundException when department is not found in institution", async () => {
    prismaMock.client.profile.findFirst.mockResolvedValue({
      institutionId: "inst-123",
    });
    jest.spyOn(DepartmentRepository.prototype, "findById").mockResolvedValue(null);

    await expect(service.findOne("dept-missing", "user-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("creates department scoped to institution", async () => {
    prismaMock.client.profile.findFirst.mockResolvedValue({
      institutionId: "inst-123",
    });
    jest.spyOn(DepartmentRepository.prototype, "findByName").mockResolvedValue(null);
    jest.spyOn(DepartmentRepository.prototype, "findByCode").mockResolvedValue(null);
    const create = jest
      .spyOn(DepartmentRepository.prototype, "create")
      .mockResolvedValue({
        id: "dept-1",
        name: "Akademik",
        code: "AKAD",
      } as never);

    const result = await service.create(
      { name: "Akademik", code: "AKAD", teacher_ids: ["t-1"] },
      "user-1",
    );

    expect(result).toBeDefined();
    expect(create).toHaveBeenCalledWith({
      name: "Akademik",
      code: "AKAD",
      institution_id: "inst-123",
      teacher_ids: ["t-1"],
    });
  });

  it("rejects duplicate department name or code within the same institution", async () => {
    prismaMock.client.profile.findFirst.mockResolvedValue({
      institutionId: "inst-123",
    });
    jest
      .spyOn(DepartmentRepository.prototype, "findByName")
      .mockResolvedValue({ id: "dept-existing" } as never);

    await expect(
      service.create({ name: "Akademik", code: "AKAD" }, "user-1"),
    ).rejects.toBeInstanceOf(ConflictException);

    jest.spyOn(DepartmentRepository.prototype, "findByName").mockResolvedValue(null);
    jest
      .spyOn(DepartmentRepository.prototype, "findByCode")
      .mockResolvedValue({ id: "dept-existing" } as never);

    await expect(
      service.create({ name: "Akademik", code: "AKAD" }, "user-1"),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("updates and deletes department with institution scoping", async () => {
    prismaMock.client.profile.findFirst.mockResolvedValue({
      institutionId: "inst-123",
    });
    jest
      .spyOn(DepartmentRepository.prototype, "findById")
      .mockResolvedValue({ id: "dept-1" } as never);
    jest.spyOn(DepartmentRepository.prototype, "findByName").mockResolvedValue(null);
    jest.spyOn(DepartmentRepository.prototype, "findByCode").mockResolvedValue(null);
    const update = jest
      .spyOn(DepartmentRepository.prototype, "update")
      .mockResolvedValue({ id: "dept-1" } as never);
    const remove = jest
      .spyOn(DepartmentRepository.prototype, "delete")
      .mockResolvedValue({ id: "dept-1" } as never);

    await service.update(
      "dept-1",
      { name: "Akademik Baru", teacher_ids: [] },
      "user-1",
    );
    expect(update).toHaveBeenCalledWith(
      "dept-1",
      { name: "Akademik Baru", teacher_ids: [] },
      "inst-123",
    );

    const deleteResult = await service.remove("dept-1", "user-1");
    expect(deleteResult).toEqual({ success: true, id: "dept-1" });
    expect(remove).toHaveBeenCalledWith("dept-1", "inst-123");
  });

  describe("create", () => {
    it("creates a department when name and code are unique", async () => {
      jest
        .spyOn(DepartmentRepository.prototype, "findByName")
        .mockResolvedValue(null);
      jest
        .spyOn(DepartmentRepository.prototype, "findByCode")
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(DepartmentRepository.prototype, "create")
        .mockResolvedValue({
          id: "dept-1",
          name: "Science",
          code: "SCI",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          teachers: [],
          subjects: [],
        });

      const result = await service.create({ name: "Science", code: "SCI" });
      expect(result).toEqual(
        expect.objectContaining({ name: "Science", code: "SCI" }),
      );
      expect(createSpy).toHaveBeenCalledWith({ name: "Science", code: "SCI" });
    });

    it("throws ConflictException when department name already exists", async () => {
      jest
        .spyOn(DepartmentRepository.prototype, "findByName")
        .mockResolvedValue({
          id: "dept-1",
          name: "Science",
          code: "SCI",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          teachers: [],
          subjects: [],
        });

      await expect(
        service.create({ name: "Science", code: "NEW-SCI" }),
      ).rejects.toThrow("Department name already exists");
    });

    it("throws ConflictException when department code already exists", async () => {
      jest
        .spyOn(DepartmentRepository.prototype, "findByName")
        .mockResolvedValue(null);
      jest
        .spyOn(DepartmentRepository.prototype, "findByCode")
        .mockResolvedValue({
          id: "dept-2",
          name: "Old Science",
          code: "SCI",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          teachers: [],
          subjects: [],
        });

      await expect(
        service.create({ name: "Science", code: "SCI" }),
      ).rejects.toThrow("Department code already exists");
    });
  });
});
