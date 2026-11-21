import { PATH_METADATA } from "@nestjs/common/constants";
import { ResponseHelper } from "@repo/shared/http/response";
import { ROLES_KEY } from "../auth/roles.decorator";
import { StudentGradeController } from "./student-grade.controller";
import type { StudentGradeService } from "./student-grade.service";
import type { Request } from "express";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {};
  },
}));

describe("StudentGradeController", () => {
  const request = { user: { sub: "user-1" } } as unknown as Request & {
    user: { sub: string };
  };
  const result = {
    data: [],
    meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
  };
  const service = {
    findAll: jest.fn().mockResolvedValue(result),
    stats: jest.fn().mockResolvedValue({
      total: 0,
      complete: 0,
      incomplete: 0,
      averageFinalScore: null,
    }),
    findOne: jest.fn().mockResolvedValue({ id: "sg-1" }),
    findByStudentId: jest.fn().mockResolvedValue([]),
    findByClassSubjectId: jest.fn().mockResolvedValue([]),
    findByAcademicYearId: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: "sg-1" }),
    update: jest.fn().mockResolvedValue({ id: "sg-1" }),
    remove: jest.fn().mockResolvedValue({ success: true, id: "sg-1" }),
  };
  const controller = new StudentGradeController(
    service as unknown as StudentGradeService,
  );

  beforeEach(() => jest.clearAllMocks());

  it("declares admin-only access", () => {
    expect(Reflect.getMetadata(ROLES_KEY, StudentGradeController)).toEqual([
      "admin",
    ]);
  });
  it("registers stats before the dynamic id route", () => {
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        StudentGradeController.prototype.stats,
      ),
    ).toBe("stats");
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        StudentGradeController.prototype.findOne,
      ),
    ).toBe(":id");
  });
  it("passes query and user context to list", async () => {
    const query = { page: 1, limit: 10, search: "Siswa" };
    const response = await controller.findAll(request, query);
    expect(service.findAll).toHaveBeenCalledWith(query, request.user);
    expect(response).toEqual(
      ResponseHelper.success(
        [],
        "Daftar nilai siswa berhasil dimuat.",
        200,
        result.meta,
      ),
    );
  });
  it("returns stats", async () => {
    await controller.stats(request);
    expect(service.stats).toHaveBeenCalledWith(request.user);
  });
  it("passes user context to read, write, and delete operations", async () => {
    await controller.findOne(request, "sg-1");
    await controller.findByStudentId(request, "student-1");
    await controller.findByClassSubjectId(request, "cs-1");
    await controller.findByAcademicYearId(request, "ay-1");
    await controller.create(request, {
      studentId: "student-1",
      classSubjectId: "cs-1",
      academicYearId: "ay-1",
    });
    await controller.update(request, "sg-1", { finalScore: 90 });
    await controller.remove(request, "sg-1");
    expect(service.findOne).toHaveBeenCalledWith("sg-1", request.user);
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: "student-1" }),
      request.user,
    );
    expect(service.update).toHaveBeenCalledWith(
      "sg-1",
      { finalScore: 90 },
      request.user,
    );
    expect(service.remove).toHaveBeenCalledWith("sg-1", request.user);
  });
});
