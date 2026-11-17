import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ExaminationRepository } from "@repo/shared/infrastructure/repository/examination.repository";
import type {
  CreateExaminationDto,
  UpdateExaminationDto,
} from "@repo/shared/schemas/examination.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { ExaminationService } from "./examination.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("ExaminationService", () => {
  const client = {
    profile: { findFirst: jest.fn() },
    classSubjects: { findFirst: jest.fn() },
    assignmentTypes: { findFirst: jest.fn() },
  };
  const repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    stats: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
  let service: ExaminationService;
  const user = { sub: "user-1" };
  const dto = {
    classSubjectId: "class-subject-1",
    title: "Ujian Tengah Semester",
  } as CreateExaminationDto;

  beforeEach(() => {
    jest.clearAllMocks();
    client.profile.findFirst.mockResolvedValue({
      institutionId: "institution-1",
    });
    client.classSubjects.findFirst.mockResolvedValue({ id: "class-subject-1" });
    client.assignmentTypes.findFirst.mockResolvedValue({ id: "type-1" });
    service = new ExaminationService(
      { client } as unknown as PrismaService,
      repository as unknown as ExaminationRepository,
    );
  });

  it("uses the token subject as createdBy and scopes the relation", async () => {
    repository.create.mockResolvedValue({ id: "exam-1" });
    await service.create(dto, user);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: "user-1",
        classSubjectId: "class-subject-1",
      }),
    );
    expect(client.classSubjects.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          class: { institution_id: "institution-1" },
        }),
      }),
    );
  });

  it("rejects an admin without an institution", async () => {
    client.profile.findFirst.mockResolvedValue(null);
    await expect(service.create(dto, user)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("rejects a class subject from another institution", async () => {
    client.classSubjects.findFirst.mockResolvedValue(null);
    await expect(service.create(dto, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("rejects a missing assignment type", async () => {
    client.assignmentTypes.findFirst.mockResolvedValue(null);
    await expect(
      service.create({ ...dto, assignmentTypeId: "type-1" }, user),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("passes query filters and institution scope to the repository", async () => {
    repository.findAll.mockResolvedValue({
      data: [],
      meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
    });
    await service.findAll(
      {
        page: 1,
        limit: 10,
        search: "UTS",
        classSubjectId: "class-subject-1",
        dateFrom: "2026-01-01T00:00:00.000Z",
      },
      user,
    );
    expect(repository.findAll).toHaveBeenCalledWith(
      1,
      10,
      expect.objectContaining({
        institutionId: "institution-1",
        classSubjectId: "class-subject-1",
        dateFrom: expect.any(Date),
      }),
    );
  });

  it("maps unique errors to ConflictException", async () => {
    repository.create.mockRejectedValue({ code: "P2002" });
    await expect(service.create(dto, user)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("rejects an examination outside the institution", async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.findById("exam-1", user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("returns scoped statistics", async () => {
    repository.stats.mockResolvedValue({
      total: 1,
      upcoming: 1,
      completed: 0,
      withoutDate: 0,
    });
    await expect(service.stats(user)).resolves.toEqual({
      total: 1,
      upcoming: 1,
      completed: 0,
      withoutDate: 0,
    });
    expect(repository.stats).toHaveBeenCalledWith("institution-1");
  });

  it("uses the token subject as updatedBy", async () => {
    repository.findById.mockResolvedValue({
      classSubjectId: "class-subject-1",
    });
    repository.update.mockResolvedValue({ id: "exam-1" });
    await service.update(
      "exam-1",
      { title: "Ujian Akhir" } as UpdateExaminationDto,
      user,
    );
    expect(repository.update).toHaveBeenCalledWith(
      "exam-1",
      expect.objectContaining({ updatedBy: "user-1" }),
    );
  });
});
