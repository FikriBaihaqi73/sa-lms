/// <reference types="jest" />

import { ClassSubjectsRepository } from "vitest";
import type { PrismaClient } from "#generated/client";

describe("ClassSubjectsRepository", () => {
  const classSubjects = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };

  const prisma = { classSubjects } as unknown as PrismaClient;
  const repository = new ClassSubjectsRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockItem = {
    id: "cs-1",
    class_id: "class-1",
    subject_id: "subject-1",
    teacher_id: "teacher-1",
    academic_year_id: "ay-1",
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    class: { id: "class-1", name: "Class 10-A" },
    subject: { id: "subject-1", code: "MATH101", name: "Mathematics" },
    teacher: { id: "teacher-1", teacher_number: "T001" },
    academic_year: { id: "ay-1", academic_year: "2024/2025" },
  };

  it("creates a class subject record", async () => {
    classSubjects.create.mockResolvedValue(mockItem);

    const input = {
      class_id: "class-1",
      subject_id: "subject-1",
      teacher_id: "teacher-1",
      academic_year_id: "ay-1",
    };

    const result = await repository.create(input);

    expect(result).toEqual(mockItem);
    expect(classSubjects.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: input,
      }),
    );
  });

  it("finds class subject by ID", async () => {
    classSubjects.findFirst.mockResolvedValue(mockItem);

    const result = await repository.findById("cs-1");

    expect(result).toEqual(mockItem);
    expect(classSubjects.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cs-1", deleted_at: null },
      }),
    );
  });

  it("returns null when ID is not found", async () => {
    classSubjects.findFirst.mockResolvedValue(null);

    const result = await repository.findById("non-existent");

    expect(result).toBeNull();
  });

  it("finds class subjects by class_id", async () => {
    classSubjects.findMany.mockResolvedValue([mockItem]);

    const result = await repository.findByClass("class-1");

    expect(result).toEqual([mockItem]);
    expect(classSubjects.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { class_id: "class-1", deleted_at: null },
      }),
    );
  });

  it("finds class subjects by subject_id", async () => {
    classSubjects.findMany.mockResolvedValue([mockItem]);

    const result = await repository.findBySubject("subject-1");

    expect(result).toEqual([mockItem]);
    expect(classSubjects.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { subject_id: "subject-1", deleted_at: null },
      }),
    );
  });

  it("finds class subjects by teacher_id", async () => {
    classSubjects.findMany.mockResolvedValue([mockItem]);

    const result = await repository.findByTeacher("teacher-1");

    expect(result).toEqual([mockItem]);
    expect(classSubjects.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teacher_id: "teacher-1", deleted_at: null },
      }),
    );
  });

  it("finds class subjects by academic_year_id", async () => {
    classSubjects.findMany.mockResolvedValue([mockItem]);

    const result = await repository.findByAcademicYear("ay-1");

    expect(result).toEqual([mockItem]);
    expect(classSubjects.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { academic_year_id: "ay-1", deleted_at: null },
      }),
    );
  });

  it("finds class subject by unique combination", async () => {
    classSubjects.findFirst.mockResolvedValue(mockItem);

    const result = await repository.findByUniqueCombination(
      "class-1",
      "subject-1",
      "teacher-1",
      "ay-1",
    );

    expect(result).toEqual(mockItem);
    expect(classSubjects.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          class_id: "class-1",
          subject_id: "subject-1",
          teacher_id: "teacher-1",
          academic_year_id: "ay-1",
          deleted_at: null,
        },
      }),
    );
  });

  it("finds all with pagination and search", async () => {
    classSubjects.findMany.mockResolvedValue([mockItem]);
    classSubjects.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10, { search: "Math" });

    expect(result).toEqual({
      data: [mockItem],
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });

    expect(classSubjects.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        where: expect.objectContaining({
          deleted_at: null,
          OR: expect.arrayContaining([
            { subject: { name: { contains: "Math", mode: "insensitive" } } },
          ]),
        }),
      }),
    );
    expect(classSubjects.count).toHaveBeenCalled();
  });

  it("updates class subject", async () => {
    const updated = { ...mockItem, teacher_id: "teacher-2" };
    classSubjects.update.mockResolvedValue(updated);

    const result = await repository.update("cs-1", { teacher_id: "teacher-2" });

    expect(result).toEqual(updated);
    expect(classSubjects.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cs-1" },
        data: { teacher_id: "teacher-2" },
      }),
    );
  });

  it("soft-deletes class subject", async () => {
    classSubjects.update.mockResolvedValue(mockItem);

    const result = await repository.delete("cs-1");

    expect(result).toEqual(mockItem);
    expect(classSubjects.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cs-1" },
        data: { deleted_at: expect.any(Date) },
      }),
    );
  });
});
