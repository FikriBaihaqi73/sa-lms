/// <reference types="jest" />
import type { PrismaClient } from "#generated/client";
import { StudentGradeRepository } from "vitest";

describe("StudentGradeRepository", () => {
  const studentGrades = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };

  const prisma = { studentGrades } as unknown as PrismaClient;
  const repository = new StudentGradeRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockItem = {
    id: "sg-1",
    studentId: "student-1",
    classSubjectId: "cs-1",
    academicYearId: "ay-1",
    assignmentScore: 85,
    quizScore: 90,
    midExamScore: 80,
    finalExamScore: 88,
    finalScore: 85.5,
    gradeId: "grade-a",
    remarks: "Good performance",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    student: { id: "student-1", studentNumber: "STD001" },
    classSubject: { id: "cs-1" },
    academicYear: { id: "ay-1", academic_year: "2024/2025" },
    grade: { id: "grade-a", grade: "A" },
  };

  it("creates a student grade record", async () => {
    studentGrades.create.mockResolvedValue(mockItem);

    const input = {
      studentId: "student-1",
      classSubjectId: "cs-1",
      academicYearId: "ay-1",
      assignmentScore: 85,
      quizScore: 90,
      midExamScore: 80,
      finalExamScore: 88,
      finalScore: 85.5,
      gradeId: "grade-a",
      remarks: "Good performance",
    };

    const result = await repository.create(input);

    expect(result).toEqual(mockItem);
    expect(studentGrades.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: input,
      }),
    );
  });

  it("finds student grade by ID", async () => {
    studentGrades.findFirst.mockResolvedValue(mockItem);

    const result = await repository.findById("sg-1");

    expect(result).toEqual(mockItem);
    expect(studentGrades.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sg-1", deletedAt: null },
      }),
    );
  });

  it("returns null when ID is not found", async () => {
    studentGrades.findFirst.mockResolvedValue(null);

    const result = await repository.findById("non-existent");

    expect(result).toBeNull();
  });

  it("finds student grades by studentId", async () => {
    studentGrades.findMany.mockResolvedValue([mockItem]);

    const result = await repository.findByStudentId("student-1");

    expect(result).toEqual([mockItem]);
    expect(studentGrades.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: "student-1", deletedAt: null },
      }),
    );
  });

  it("finds student grades by classSubjectId", async () => {
    studentGrades.findMany.mockResolvedValue([mockItem]);

    const result = await repository.findByClassSubjectId("cs-1");

    expect(result).toEqual([mockItem]);
    expect(studentGrades.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { classSubjectId: "cs-1", deletedAt: null },
      }),
    );
  });

  it("finds student grades by academicYearId", async () => {
    studentGrades.findMany.mockResolvedValue([mockItem]);

    const result = await repository.findByAcademicYearId("ay-1");

    expect(result).toEqual([mockItem]);
    expect(studentGrades.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { academicYearId: "ay-1", deletedAt: null },
      }),
    );
  });

  it("finds student grade by unique combination", async () => {
    studentGrades.findFirst.mockResolvedValue(mockItem);

    const result = await repository.findByUniqueCombination(
      "student-1",
      "cs-1",
      "ay-1",
    );

    expect(result).toEqual(mockItem);
    expect(studentGrades.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          studentId: "student-1",
          classSubjectId: "cs-1",
          academicYearId: "ay-1",
          deletedAt: null,
        },
      }),
    );
  });

  it("finds all with pagination and search", async () => {
    studentGrades.findMany.mockResolvedValue([mockItem]);
    studentGrades.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10, { search: "STD001" });

    expect(result).toEqual({
      data: [mockItem],
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });

    expect(studentGrades.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        where: expect.objectContaining({
          deletedAt: null,
          OR: expect.arrayContaining([
            {
              student: {
                studentNumber: { contains: "STD001", mode: "insensitive" },
              },
            },
          ]),
        }),
      }),
    );
    expect(studentGrades.count).toHaveBeenCalled();
  });

  it("updates student grade record", async () => {
    const updated = { ...mockItem, finalScore: 90 };
    studentGrades.update.mockResolvedValue(updated);

    const result = await repository.update("sg-1", { finalScore: 90 });

    expect(result).toEqual(updated);
    expect(studentGrades.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sg-1" },
        data: { finalScore: 90 },
      }),
    );
  });

  it("soft-deletes student grade record", async () => {
    studentGrades.update.mockResolvedValue(mockItem);

    const result = await repository.delete("sg-1");

    expect(result).toEqual(mockItem);
    expect(studentGrades.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sg-1" },
        data: { deletedAt: expect.any(Date) },
      }),
    );
  });
});
