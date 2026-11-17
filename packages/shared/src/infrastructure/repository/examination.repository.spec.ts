/// <reference types="jest" />

import type { PrismaClient } from "#generated/client";
import { examinationSelect } from "#selects/examination.select";
import { ExaminationRepository } from "./examination.repository";

describe("ExaminationRepository", () => {
  const examinations = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };
  const repository = new ExaminationRepository({
    examinations,
  } as unknown as PrismaClient);

  beforeEach(() => jest.clearAllMocks());

  it("creates an examination and normalizes maximumScore", async () => {
    const item = { id: "exam-1", maximumScore: "100.00" };
    examinations.create.mockResolvedValue(item);
    await expect(
      repository.create({
        createdBy: "user-1",
        classSubjectId: "class-subject-1",
        assignmentTypeId: "type-1",
        title: "Midterm Exam",
        description: "Covers chapter 1-5",
        maximumScore: 100,
      }),
    ).resolves.toEqual({ id: "exam-1", maximumScore: 100 });
    expect(examinations.create).toHaveBeenCalledWith({
      data: {
        createdBy: "user-1",
        classSubjectId: "class-subject-1",
        assignmentTypeId: "type-1",
        title: "Midterm Exam",
        description: "Covers chapter 1-5",
        maximumScore: 100,
      },
      select: examinationSelect,
    });
  });

  it("scopes findById to the institution", async () => {
    const item = { id: "exam-1", maximumScore: null };
    examinations.findFirst.mockResolvedValue(item);
    await expect(
      repository.findById("exam-1", "institution-1"),
    ).resolves.toEqual(item);
    expect(examinations.findFirst).toHaveBeenCalledWith({
      where: {
        id: "exam-1",
        deletedAt: null,
        classSubject: { class: { institution_id: "institution-1" } },
      },
      select: examinationSelect,
    });
  });

  it("supports pagination, search, relation, and date filters", async () => {
    examinations.findMany.mockResolvedValue([
      { id: "exam-1", maximumScore: null },
    ]);
    examinations.count.mockResolvedValue(1);
    await expect(
      repository.findAll(2, 5, {
        institutionId: "institution-1",
        search: "Midterm",
        classSubjectId: "class-subject-1",
        assignmentTypeId: "type-1",
        dateFrom: new Date("2026-01-01T00:00:00.000Z"),
        dateTo: new Date("2026-12-31T00:00:00.000Z"),
      }),
    ).resolves.toMatchObject({
      meta: { totalData: 1, currentPage: 2, perPage: 5 },
    });
    expect(examinations.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        select: examinationSelect,
        where: expect.objectContaining({
          classSubjectId: "class-subject-1",
          assignmentTypeId: "type-1",
          examinationDate: { gte: expect.any(Date), lte: expect.any(Date) },
        }),
      }),
    );
  });

  it("returns scoped statistics", async () => {
    examinations.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    await expect(repository.stats("institution-1")).resolves.toEqual({
      total: 4,
      upcoming: 1,
      completed: 2,
      withoutDate: 1,
    });
    expect(examinations.count).toHaveBeenCalledTimes(4);
  });

  it("soft-deletes an examination", async () => {
    const item = { id: "exam-1", maximumScore: null };
    examinations.update.mockResolvedValue(item);
    await expect(repository.softDelete("exam-1")).resolves.toEqual(item);
    expect(examinations.update).toHaveBeenCalledWith({
      where: { id: "exam-1" },
      data: { deletedAt: expect.any(Date) },
      select: examinationSelect,
    });
  });
});
