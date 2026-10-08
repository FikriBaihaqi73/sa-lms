/// <reference types="jest" />
import type { PrismaClient } from "#generated/client";
import { StudyResultRepository } from "vitest";

describe("StudyResultRepository", () => {
  const studyResult = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };

  const prisma = { studyResult } as unknown as PrismaClient;
  const repository = new StudyResultRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStudyResult = {
    id: "sr-1",
    studentId: "student-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    totalCredits: 24,
    semesterGpa: 3.85,
    cumulativeGpa: 3.8,
    academicStatusId: "status-active",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    student: {
      id: "student-1",
      studentNumber: "STD001",
      profile: { fullName: "John Doe" },
    },
    academicYear: {
      id: "ay-1",
      academic_year: "2024/2025",
    },
    semester: {
      id: "sem-1",
      name: "Odd Semester",
    },
    academicStatus: {
      id: "status-active",
      name: "Active",
    },
  };

  it("creates a study result record", async () => {
    studyResult.create.mockResolvedValue(mockStudyResult);

    const input = {
      studentId: "student-1",
      academicYearId: "ay-1",
      semesterId: "sem-1",
      totalCredits: 24,
      semesterGpa: 3.85,
      cumulativeGpa: 3.8,
      academicStatusId: "status-active",
    };

    const result = await repository.create(input);

    expect(result).toEqual(mockStudyResult);
    expect(studyResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          studentId: "student-1",
          academicYearId: "ay-1",
          semesterId: "sem-1",
          totalCredits: 24,
          semesterGpa: 3.85,
          cumulativeGpa: 3.8,
          academicStatusId: "status-active",
        },
      }),
    );
  });

  it("finds study result by ID", async () => {
    studyResult.findFirst.mockResolvedValue(mockStudyResult);

    const result = await repository.findById("sr-1");

    expect(result).toEqual(mockStudyResult);
    expect(studyResult.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sr-1", deletedAt: null },
      }),
    );
  });

  it("returns null when ID is not found", async () => {
    studyResult.findFirst.mockResolvedValue(null);

    const result = await repository.findById("non-existent");

    expect(result).toBeNull();
  });

  it("finds study results by studentId", async () => {
    studyResult.findMany.mockResolvedValue([mockStudyResult]);

    const result = await repository.findByStudentId("student-1");

    expect(result).toEqual([mockStudyResult]);
    expect(studyResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: "student-1", deletedAt: null },
      }),
    );
  });

  it("finds study results by academicYearId", async () => {
    studyResult.findMany.mockResolvedValue([mockStudyResult]);

    const result = await repository.findByAcademicYearId("ay-1");

    expect(result).toEqual([mockStudyResult]);
    expect(studyResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { academicYearId: "ay-1", deletedAt: null },
      }),
    );
  });

  it("finds study results by semesterId", async () => {
    studyResult.findMany.mockResolvedValue([mockStudyResult]);

    const result = await repository.findBySemesterId("sem-1");

    expect(result).toEqual([mockStudyResult]);
    expect(studyResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { semesterId: "sem-1", deletedAt: null },
      }),
    );
  });

  it("finds study result by unique combination", async () => {
    studyResult.findFirst.mockResolvedValue(mockStudyResult);

    const result = await repository.findByUniqueCombination(
      "student-1",
      "ay-1",
      "sem-1",
    );

    expect(result).toEqual(mockStudyResult);
    expect(studyResult.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          studentId: "student-1",
          academicYearId: "ay-1",
          semesterId: "sem-1",
          deletedAt: null,
        },
      }),
    );
  });

  it("finds all with pagination and search filter", async () => {
    studyResult.findMany.mockResolvedValue([mockStudyResult]);
    studyResult.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10, { search: "John" });

    expect(result).toEqual({
      data: [mockStudyResult],
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });

    expect(studyResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        where: expect.objectContaining({
          deletedAt: null,
          OR: expect.arrayContaining([
            {
              student: {
                profile: {
                  fullName: { contains: "John", mode: "insensitive" },
                },
              },
            },
          ]),
        }),
      }),
    );
    expect(studyResult.count).toHaveBeenCalled();
  });

  it("updates study result record", async () => {
    const updated = { ...mockStudyResult, semesterGpa: 3.9 };
    studyResult.update.mockResolvedValue(updated);

    const result = await repository.update("sr-1", { semesterGpa: 3.9 });

    expect(result).toEqual(updated);
    expect(studyResult.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sr-1" },
        data: { semesterGpa: 3.9 },
      }),
    );
  });

  it("soft-deletes study result record", async () => {
    studyResult.update.mockResolvedValue(mockStudyResult);

    const result = await repository.delete("sr-1");

    expect(result).toEqual(mockStudyResult);
    expect(studyResult.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sr-1" },
        data: { deletedAt: expect.any(Date) },
      }),
    );
  });
});
