/// <reference types="jest" />
import type { GradeEntity } from "#entities/grades.entity";
import type { PrismaClient } from "#generated/client";
import { gradeSelect } from "#selects/grades.select";
import { GradeRepository } from "vitest";

describe("GradeRepository", () => {
  const create = vi.fn();
  const findFirst = vi.fn();
  const findMany = vi.fn();
  const update = vi.fn();
  const prisma = {
    grades: { create, findFirst, findMany, update },
  } as unknown as PrismaClient;
  const repository = new GradeRepository(prisma);
  const grade = { id: "grade-id" } as unknown as GradeEntity;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a grade with all provided fields", async () => {
    create.mockResolvedValue(grade);

    await expect(
      repository.create({
        grade: "A",
        minimumScore: 80,
        maximumScore: 100,
        description: "Excellent",
      }),
    ).resolves.toBe(grade);

    expect(create).toHaveBeenCalledWith({
      data: {
        grade: "A",
        minimumScore: 80,
        maximumScore: 100,
        description: "Excellent",
      },
      select: gradeSelect,
    });
  });

  it("reads only non-deleted grades", async () => {
    findFirst.mockResolvedValue(grade);
    findMany.mockResolvedValue([grade]);

    await expect(repository.findById("grade-id")).resolves.toBe(grade);
    await expect(repository.findByGrade("A")).resolves.toBe(grade);
    await expect(repository.findAll()).resolves.toEqual([grade]);

    expect(findFirst).toHaveBeenNthCalledWith(1, {
      where: { id: "grade-id", deletedAt: null },
      select: gradeSelect,
    });
    expect(findFirst).toHaveBeenNthCalledWith(2, {
      where: { grade: "A", deletedAt: null },
      select: gradeSelect,
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      select: gradeSelect,
    });
  });

  it("updates a grade and soft-deletes it", async () => {
    update.mockResolvedValue(grade);

    await expect(
      repository.update("grade-id", {
        maximumScore: 95,
        description: "Updated",
      }),
    ).resolves.toBe(grade);
    await expect(repository.delete("grade-id")).resolves.toBe(grade);

    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: "grade-id" },
      data: { maximumScore: 95, description: "Updated" },
      select: gradeSelect,
    });
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: "grade-id" },
      data: { deletedAt: expect.any(Date) },
      select: gradeSelect,
    });
  });
});
