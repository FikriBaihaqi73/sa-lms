/// <reference types="jest" />

import { ExaminationRepository } from "vitest";
import type { PrismaClient } from "#generated/client";
import { examinationSelect } from "#selects/examination.select";

describe("ExaminationRepository", () => {
  const examinations = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const repository = new ExaminationRepository({
    examinations,
  } as unknown as PrismaClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an examination with its fields", async () => {
    const item = { id: "exam-1" };
    examinations.create.mockResolvedValue(item);

    await expect(
      repository.create({
        classSubjectId: "class-subject-1",
        assignmentTypeId: "type-1",
        title: "Midterm Exam",
        description: "Covers chapter 1-5",
        maximumScore: 100,
      }),
    ).resolves.toEqual(item);

    expect(examinations.create).toHaveBeenCalledWith({
      data: {
        classSubjectId: "class-subject-1",
        assignmentTypeId: "type-1",
        title: "Midterm Exam",
        description: "Covers chapter 1-5",
        maximumScore: 100,
      },
      select: examinationSelect,
    });
  });

  it("finds an examination by ID while eager-loading relations", async () => {
    const item = { id: "exam-1" };
    examinations.findFirst.mockResolvedValue(item);

    await expect(repository.findById("exam-1")).resolves.toEqual(item);
    expect(examinations.findFirst).toHaveBeenCalledWith({
      where: { id: "exam-1", deletedAt: null },
      select: examinationSelect,
    });
  });

  it("finds examinations with pagination and search", async () => {
    const data = [{ id: "exam-1" }];
    examinations.findMany.mockResolvedValue(data);
    examinations.count.mockResolvedValue(1);

    await expect(
      repository.findAll(2, 5, { search: "Midterm" }),
    ).resolves.toEqual({
      data,
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 2,
        perPage: 5,
      },
    });

    expect(examinations.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        select: examinationSelect,
        where: expect.objectContaining({
          deletedAt: null,
          OR: expect.arrayContaining([
            { title: { contains: "Midterm", mode: "insensitive" } },
            { description: { contains: "Midterm", mode: "insensitive" } },
          ]),
        }),
      }),
    );
    expect(examinations.count).toHaveBeenCalled();
  });

  it("soft-deletes an examination", async () => {
    const item = { id: "exam-1" };
    examinations.update.mockResolvedValue(item);

    await expect(repository.softDelete("exam-1")).resolves.toEqual(item);
    expect(examinations.update).toHaveBeenCalledWith({
      where: { id: "exam-1" },
      data: { deletedAt: expect.any(Date) },
      select: examinationSelect,
    });
  });
});
