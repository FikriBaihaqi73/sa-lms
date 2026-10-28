import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import {
  ClassSubjectQuerySchema,
  type CreateClassSubjectDto,
} from "@repo/shared/schemas/class-subject.schema";
import "reflect-metadata";
import { ROLES_KEY } from "../auth/roles.decorator";
import { ClassSubjectController } from "./class-subject.controller";
import { ClassSubjectService } from "./class-subject.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("ClassSubjectController", () => {
  let controller: ClassSubjectController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByClass: jest.fn(),
    findBySubject: jest.fn(),
    findByTeacher: jest.fn(),
    findByAcademicYear: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const request = { user: { sub: "user-1" } };
  const record = {
    id: "cs-1",
    class_id: "class-1",
    subject_id: "subject-1",
    teacher_id: "teacher-1",
    academic_year_id: "ay-1",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassSubjectController],
      providers: [{ provide: ClassSubjectService, useValue: service }],
    }).compile();
    controller = module.get(ClassSubjectController);
    jest.clearAllMocks();
  });

  it("restricts the controller to admins", () => {
    expect(Reflect.getMetadata(ROLES_KEY, ClassSubjectController)).toEqual([
      "admin",
    ]);
  });

  it("passes institution user and filters to the paginated list", async () => {
    const result = {
      data: [record],
      meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
    };
    service.findAll.mockResolvedValue(result);
    await expect(
      controller.findAll(request, {
        page: 2,
        limit: 25,
        search: "Math",
        class_id: "class-1",
        academic_year_id: "ay-1",
        teacher_id: "teacher-1",
      }),
    ).resolves.toEqual(
      ResponseHelper.success(
        [record],
        "Class subjects retrieved successfully",
        200,
        result.meta,
      ),
    );
    expect(service.findAll).toHaveBeenCalledWith(
      2,
      25,
      {
        search: "Math",
        class_id: "class-1",
        academic_year_id: "ay-1",
        teacher_id: "teacher-1",
      },
      "user-1",
    );
  });

  it.each([
    ["negative page", { page: -1, limit: 10 }],
    ["zero page", { page: 0, limit: 10 }],
    ["zero limit", { page: 1, limit: 0 }],
    ["oversized limit", { page: 1, limit: 101 }],
    ["invalid class UUID", { page: 1, limit: 10, class_id: "not-a-uuid" }],
    [
      "invalid academic year UUID",
      { page: 1, limit: 10, academic_year_id: "not-a-uuid" },
    ],
    ["invalid teacher UUID", { page: 1, limit: 10, teacher_id: "not-a-uuid" }],
  ])("rejects invalid pagination/filter input: %s", (_label, query) => {
    expect(ClassSubjectQuerySchema.safeParse(query).success).toBe(false);
  });

  it("passes user identity to detail and mutations", async () => {
    const dto: CreateClassSubjectDto = {
      class_id: "class-1",
      subject_id: "subject-1",
      teacher_id: "teacher-1",
      academic_year_id: "ay-1",
    };
    service.findOne.mockResolvedValue(record);
    service.create.mockResolvedValue(record);
    service.update.mockResolvedValue(record);
    service.remove.mockResolvedValue(record);
    await controller.findOne("cs-1", request);
    await controller.create(dto, request);
    await controller.update("cs-1", { teacher_id: "teacher-1" }, request);
    await controller.remove("cs-1", request);
    expect(service.findOne).toHaveBeenCalledWith("cs-1", "user-1");
    expect(service.create).toHaveBeenCalledWith(dto, "user-1");
    expect(service.update).toHaveBeenCalledWith(
      "cs-1",
      { teacher_id: "teacher-1" },
      "user-1",
    );
    expect(service.remove).toHaveBeenCalledWith("cs-1", "user-1");
  });
});
