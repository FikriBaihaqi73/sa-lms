import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { StudentGradeRepository } from "@repo/shared/infrastructure/repository/student-grade.repository";
import {
  CreateStudentGradeSchema,
  UpdateStudentGradeSchema,
} from "@repo/shared/schemas/student-grade.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { StudentGradeService } from "./student-grade.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("StudentGradeService", () => {
  const record = {
    id: "sg-1",
    studentId: "student-1",
    classSubjectId: "cs-1",
    academicYearId: "ay-1",
    finalScore: 90,
  };
  const user = { sub: "user-1" };
  const setup = () => {
    const prisma = {
      profile: {
        findFirst: jest.fn().mockResolvedValue({ institutionId: "inst-1" }),
      },
      student: { findFirst: jest.fn().mockResolvedValue({ id: "student-1" }) },
      classSubjects: {
        findFirst: jest.fn().mockResolvedValue({
          id: "cs-1",
          academic_year_id: "33333333-3333-4333-8333-333333333333",
        }),
      },
      academicYears: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: "33333333-3333-4333-8333-333333333333" }),
      },
      grades: { findFirst: jest.fn().mockResolvedValue({ id: "grade-a" }) },
    };
    return {
      prisma,
      service: new StudentGradeService({
        client: prisma,
      } as unknown as PrismaService),
    };
  };
  const dto = {
    studentId: "11111111-1111-4111-8111-111111111111",
    classSubjectId: "22222222-2222-4222-8222-222222222222",
    academicYearId: "33333333-3333-4333-8333-333333333333",
    finalScore: 90,
  };

  beforeEach(() => jest.restoreAllMocks());

  it("requires an institution for the authenticated user", async () => {
    const { prisma, service } = setup();
    prisma.profile.findFirst.mockResolvedValue(null);
    await expect(service.stats(user)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
  it("scopes list and stats through the authenticated user", async () => {
    const { service } = setup();
    jest.spyOn(StudentGradeRepository.prototype, "findAll").mockResolvedValue({
      data: [],
      meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
    });
    jest.spyOn(StudentGradeRepository.prototype, "stats").mockResolvedValue({
      total: 0,
      complete: 0,
      incomplete: 0,
      averageFinalScore: null,
    });
    await service.findAll(
      {
        page: 1,
        limit: 10,
        search: "kelas",
        classSubjectId: "cs-1",
        academicYearId: "ay-1",
        studentId: "student-1",
      },
      user,
    );
    expect(StudentGradeRepository.prototype.findAll).toHaveBeenCalledWith(
      1,
      10,
      expect.objectContaining({ institutionId: "inst-1" }),
    );
    await service.stats(user);
    expect(StudentGradeRepository.prototype.stats).toHaveBeenCalledWith(
      "inst-1",
    );
  });
  it("rejects a relation from another institution without revealing it", async () => {
    const { prisma, service } = setup();
    prisma.classSubjects.findFirst.mockResolvedValue(null);
    await expect(service.create(dto, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it("rejects a mismatched academic year", async () => {
    const { prisma, service } = setup();
    prisma.classSubjects.findFirst.mockResolvedValue({
      id: "cs-1",
      academic_year_id: "other-ay",
    });
    await expect(service.create(dto, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it("rejects duplicate combinations", async () => {
    const { service } = setup();
    jest
      .spyOn(StudentGradeRepository.prototype, "findByUniqueCombination")
      .mockResolvedValue(record as never);
    await expect(service.create(dto, user)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it("maps a database duplicate error", async () => {
    const { service } = setup();
    jest
      .spyOn(StudentGradeRepository.prototype, "findByUniqueCombination")
      .mockResolvedValue(null);
    jest
      .spyOn(StudentGradeRepository.prototype, "create")
      .mockRejectedValue({ code: "P2002" });
    await expect(service.create(dto, user)).rejects.toThrow(
      "Nilai untuk siswa",
    );
  });
  it("maps an invalid relation error", async () => {
    const { service } = setup();
    jest
      .spyOn(StudentGradeRepository.prototype, "findByUniqueCombination")
      .mockResolvedValue(null);
    jest
      .spyOn(StudentGradeRepository.prototype, "create")
      .mockRejectedValue({ code: "P2003" });
    await expect(service.create(dto, user)).rejects.toThrow(
      "Relasi data nilai tidak valid",
    );
  });
  it("allows boundary scores and rejects scores over 100 or with more than two decimals", () => {
    expect(
      CreateStudentGradeSchema.safeParse({ ...dto, finalScore: 0 }).success,
    ).toBe(true);
    expect(
      CreateStudentGradeSchema.safeParse({ ...dto, finalScore: 100 }).success,
    ).toBe(true);
    expect(
      CreateStudentGradeSchema.safeParse({ ...dto, finalScore: 100.01 })
        .success,
    ).toBe(false);
    expect(
      CreateStudentGradeSchema.safeParse({ ...dto, finalScore: 10.123 })
        .success,
    ).toBe(false);
  });
  it("does not allow changing unique-key fields on update", () => {
    const result = UpdateStudentGradeSchema.safeParse({
      studentId: "not-used",
      finalScore: 90,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect("studentId" in result.data).toBe(false);
  });
});
