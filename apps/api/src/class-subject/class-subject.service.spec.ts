import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ClassSubjectsRepository } from "@repo/shared/infrastructure/repository/class-subjects.repository";
import type { CreateClassSubjectDto } from "@repo/shared/schemas/class-subject.schema";
import type { PrismaClient } from "#generated/client";
import type { PrismaService } from "../prisma/prisma.service";
import { ClassSubjectService } from "./class-subject.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

type MockClient = {
  profile: { findFirst: jest.Mock };
  classes: { findFirst: jest.Mock };
  subject: { findFirst: jest.Mock };
  teachers: { findFirst: jest.Mock };
  academicYears: { findFirst: jest.Mock };
};

describe("ClassSubjectService", () => {
  let service: ClassSubjectService;
  let client: MockClient;
  const record = {
    id: "cs-1",
    class_id: "class-1",
    subject_id: "subject-1",
    teacher_id: "teacher-1",
    academic_year_id: "ay-1",
  };
  const dto: CreateClassSubjectDto = {
    class_id: "class-1",
    subject_id: "subject-1",
    teacher_id: "teacher-1",
    academic_year_id: "ay-1",
  };

  beforeEach(() => {
    client = {
      profile: { findFirst: jest.fn() },
      classes: { findFirst: jest.fn() },
      subject: { findFirst: jest.fn() },
      teachers: { findFirst: jest.fn() },
      academicYears: { findFirst: jest.fn() },
    };
    service = new ClassSubjectService({
      client: client as unknown as PrismaClient,
    } as unknown as PrismaService);
    client.profile.findFirst.mockResolvedValue({ institutionId: "inst-1" });
  });

  const relationsExist = () => {
    client.classes.findFirst.mockResolvedValue({
      id: "class-1",
      institution_id: "inst-1",
    });
    client.subject.findFirst.mockResolvedValue({
      id: "subject-1",
      institutionId: "inst-1",
    });
    client.teachers.findFirst.mockResolvedValue({ id: "teacher-1" });
    client.academicYears.findFirst.mockResolvedValue({
      id: "ay-1",
      institution_id: "inst-1",
    });
  };

  afterEach(() => jest.restoreAllMocks());

  it("rejects access when the admin has no institution", async () => {
    client.profile.findFirst.mockResolvedValue(null);
    await expect(service.findAll(1, 10, {}, "user-1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("scopes list queries to the admin institution and filters", async () => {
    const result = {
      data: [record],
      meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
    };
    const findAll = jest
      .spyOn(ClassSubjectsRepository.prototype, "findAll")
      .mockResolvedValue(result as never);
    await service.findAll(
      1,
      10,
      {
        search: "Math",
        class_id: "class-1",
        academic_year_id: "ay-1",
        teacher_id: "teacher-1",
      },
      "user-1",
    );
    expect(findAll).toHaveBeenCalledWith(1, 10, {
      search: "Math",
      class_id: "class-1",
      academic_year_id: "ay-1",
      teacher_id: "teacher-1",
      institution_id: "inst-1",
    });
  });

  it("rejects a relation from another institution as not found", async () => {
    client.classes.findFirst.mockResolvedValue(null);
    client.subject.findFirst.mockResolvedValue({});
    client.teachers.findFirst.mockResolvedValue({});
    client.academicYears.findFirst.mockResolvedValue({});
    await expect(service.create(dto, "user-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("rejects duplicates by class, subject, and academic year regardless of teacher", async () => {
    relationsExist();
    jest
      .spyOn(ClassSubjectsRepository.prototype, "findByUniqueCombination")
      .mockResolvedValue(record as never);
    await expect(service.create(dto, "user-1")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("maps a Prisma unique constraint race to ConflictException", async () => {
    relationsExist();
    jest
      .spyOn(ClassSubjectsRepository.prototype, "findByUniqueCombination")
      .mockResolvedValue(null);
    jest
      .spyOn(ClassSubjectsRepository.prototype, "create")
      .mockRejectedValue({ code: "P2002" });

    await expect(service.create(dto, "user-1")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("soft deletes when all dependent relations are already soft-deleted", async () => {
    const findById = jest
      .spyOn(ClassSubjectsRepository.prototype, "findById")
      .mockResolvedValue(record as never);
    jest
      .spyOn(ClassSubjectsRepository.prototype, "findUsage")
      .mockResolvedValue({
        schedules: 0,
        modules: 0,
        examinations: 0,
        studentGrades: 0,
      });
    const remove = jest
      .spyOn(ClassSubjectsRepository.prototype, "delete")
      .mockResolvedValue(record as never);
    await expect(service.remove("cs-1", "user-1")).resolves.toEqual(record);
    expect(findById).toHaveBeenCalledWith("cs-1", "inst-1");
    expect(remove).toHaveBeenCalledWith("cs-1", "inst-1");
  });

  it.each([
    ["Schedule", { schedules: 1, modules: 0, examinations: 0, studentGrades: 0 }],
    ["Modules", { schedules: 0, modules: 1, examinations: 0, studentGrades: 0 }],
    ["Examinations", { schedules: 0, modules: 0, examinations: 1, studentGrades: 0 }],
    ["StudentGrades", { schedules: 0, modules: 0, examinations: 0, studentGrades: 1 }],
  ])("rejects delete when an active %s relation exists", async (_relation, usage) => {
    jest.spyOn(ClassSubjectsRepository.prototype, "findById").mockResolvedValue(record as never);
    jest.spyOn(ClassSubjectsRepository.prototype, "findUsage").mockResolvedValue(usage);
    await expect(service.remove("cs-1", "user-1")).rejects.toBeInstanceOf(ConflictException);
  });
});
