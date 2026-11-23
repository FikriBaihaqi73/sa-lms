import type { PrismaClient } from "#generated/client";
import { StudentGradeRepository } from "./student-grade.repository";

describe("StudentGradeRepository", () => {
  const response = {
    id: "sg-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    studentId: "student-1",
    classSubjectId: "cs-1",
    academicYearId: "ay-1",
    assignmentScore: 80,
    quizScore: null,
    midExamScore: 75,
    finalExamScore: 90,
    finalScore: 82.5,
    gradeId: "grade-a",
    remarks: null,
    student: {
      id: "student-1",
      studentNumber: "STD-1",
      profile: { fullName: "Siswa Satu" },
    },
    classSubject: {
      id: "cs-1",
      class: { id: "class-1", name: "Kelas 1" },
      subject: { id: "sub-1", name: "Matematika" },
      academic_year: { id: "ay-1", academic_year: "2026/2027" },
    },
    academicYear: { id: "ay-1", academic_year: "2026/2027" },
    grade: {
      id: "grade-a",
      grade: "A",
      minimumScore: 80,
      maximumScore: 100,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  };
  const setup = () => {
    const prisma = {
      classSubjects: { findFirst: jest.fn().mockResolvedValue({ id: "cs-1" }) },
      studentGrades: {
        create: jest.fn().mockResolvedValue(response),
        findFirst: jest.fn().mockResolvedValue(response),
        findMany: jest.fn().mockResolvedValue([response]),
        count: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
        aggregate: jest.fn().mockResolvedValue({ _avg: { finalScore: 82.5 } }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaClient;
    return { prisma, repository: new StudentGradeRepository(prisma) };
  };

  it("scopes reads by institution and normalizes Decimal scores", async () => {
    const { prisma, repository } = setup();
    const result = await repository.findById("sg-1", "inst-1");
    expect(result?.finalScore).toBe(82.5);
    expect(prisma.studentGrades.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "sg-1",
          deletedAt: null,
          classSubject: { class: { institution_id: "inst-1" } },
        },
      }),
    );
  });
  it("filters list and clamps pagination to the supported range", async () => {
    const { prisma, repository } = setup();
    await repository.findAll(0, 1000, {
      institutionId: "inst-1",
      classSubjectId: "cs-1",
      academicYearId: "ay-1",
      studentId: "student-1",
      search: "Siswa",
    });
    expect(prisma.studentGrades.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 100 }),
    );
  });
  it("returns scoped stats", async () => {
    const { prisma, repository } = setup();
    const result = await repository.stats("inst-1");
    expect(result).toEqual({
      total: 1,
      complete: 1,
      incomplete: 0,
      averageFinalScore: 82.5,
    });
    expect(prisma.studentGrades.aggregate).toHaveBeenCalled();
  });
  it("checks scope before create", async () => {
    const { prisma, repository } = setup();
    await repository.create({
      studentId: "student-1",
      classSubjectId: "cs-1",
      academicYearId: "ay-1",
      institutionId: "inst-1",
      finalScore: 100,
    });
    expect(prisma.classSubjects.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "cs-1",
          deleted_at: null,
          class: { institution_id: "inst-1" },
        },
      }),
    );
  });
  it("soft deletes only an in-scope record", async () => {
    const { prisma, repository } = setup();
    await repository.delete("sg-1", "inst-1");
    expect(prisma.studentGrades.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "sg-1",
          deletedAt: null,
          classSubject: { class: { institution_id: "inst-1" } },
        },
      }),
    );
  });
});
