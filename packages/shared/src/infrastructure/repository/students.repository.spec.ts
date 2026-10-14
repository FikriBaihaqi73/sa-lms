import type { PrismaClient } from "#generated/client";
import { StudentRepository } from "./students.repository";

describe("StudentRepository", () => {
  const student = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const prisma = {
    student,
  } as unknown as PrismaClient;

  const repository = new StudentRepository(prisma);

  const sampleStudent = {
    id: "student-uuid-1",
    profileId: "profile-uuid-1",
    departmentId: "dept-uuid-1",
    academicStatusId: "status-uuid-1",
    studentNumber: "20260001",
    enrollmentYear: 2026,
    referralCode: "REF-2026-ABC",
    referralExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    profile: {
      id: "profile-uuid-1",
      fullName: "Budi Santoso",
      email: "budi@example.com",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a student with referralCode and referralExpiresAt", async () => {
      student.create.mockResolvedValue(sampleStudent);

      const result = await repository.create({
        profileId: "profile-uuid-1",
        departmentId: "dept-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260001",
        enrollmentYear: 2026,
        referralCode: "  REF-2026-ABC  ",
        referralExpiresAt: "2026-12-31",
      });

      expect(result).toEqual(sampleStudent);
      expect(student.create).toHaveBeenCalledWith({
        data: {
          profileId: "profile-uuid-1",
          departmentId: "dept-uuid-1",
          academicStatusId: "status-uuid-1",
          studentNumber: "20260001",
          enrollmentYear: 2026,
          referralCode: "REF-2026-ABC",
          referralExpiresAt: new Date("2026-12-31"),
        },
        select: expect.any(Object),
      });
    });

    it("creates a student with null referralCode and referralExpiresAt when not provided", async () => {
      const studentWithoutReferral = {
        ...sampleStudent,
        referralCode: null,
        referralExpiresAt: null,
      };
      student.create.mockResolvedValue(studentWithoutReferral);

      const result = await repository.create({
        profileId: "profile-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260002",
      });

      expect(result.referralCode).toBeNull();
      expect(result.referralExpiresAt).toBeNull();
      expect(student.create).toHaveBeenCalledWith({
        data: {
          profileId: "profile-uuid-1",
          departmentId: null,
          academicStatusId: "status-uuid-1",
          studentNumber: "20260002",
          enrollmentYear: null,
          referralCode: null,
          referralExpiresAt: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("findById", () => {
    it("returns student when found", async () => {
      student.findFirst.mockResolvedValue(sampleStudent);

      const result = await repository.findById("student-uuid-1");

      expect(result).toEqual(sampleStudent);
      expect(student.findFirst).toHaveBeenCalledWith({
        where: {
          id: "student-uuid-1",
          deletedAt: null,
        },
        select: expect.any(Object),
      });
    });

    it("returns null when student is not found", async () => {
      student.findFirst.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findByStudentNumber", () => {
    it("returns student by studentNumber", async () => {
      student.findFirst.mockResolvedValue(sampleStudent);

      const result = await repository.findByStudentNumber("20260001");

      expect(result).toEqual(sampleStudent);
      expect(student.findFirst).toHaveBeenCalledWith({
        where: {
          studentNumber: "20260001",
          deletedAt: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("findByProfileId", () => {
    it("returns student by profileId", async () => {
      student.findFirst.mockResolvedValue(sampleStudent);

      const result = await repository.findByProfileId("profile-uuid-1");

      expect(result).toEqual(sampleStudent);
      expect(student.findFirst).toHaveBeenCalledWith({
        where: {
          profileId: "profile-uuid-1",
          deletedAt: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("findAll", () => {
    it("returns paginated students with default parameters", async () => {
      student.findMany.mockResolvedValue([sampleStudent]);
      student.count.mockResolvedValue(1);

      const result = await repository.findAll({});

      expect(result).toEqual({
        data: [sampleStudent],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
      expect(student.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("filters by search term across student number, profile, and referral code", async () => {
      student.findMany.mockResolvedValue([sampleStudent]);
      student.count.mockResolvedValue(1);

      const result = await repository.findAll({
        page: 2,
        limit: 5,
        search: "REF-2026",
      });

      expect(result.data).toEqual([sampleStudent]);
      expect(result.meta).toEqual({
        page: 2,
        limit: 5,
        total: 1,
        totalPages: 1,
      });
      expect(student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          where: expect.objectContaining({
            deletedAt: null,
            OR: expect.arrayContaining([
              { referralCode: { contains: "REF-2026", mode: "insensitive" } },
            ]),
          }),
        }),
      );
    });
  });

  describe("update", () => {
    it("updates referralCode and referralExpiresAt", async () => {
      const updated = {
        ...sampleStudent,
        referralCode: "NEW-CODE-999",
        referralExpiresAt: new Date("2027-01-01T00:00:00.000Z"),
      };
      student.update.mockResolvedValue(updated);

      const result = await repository.update("student-uuid-1", {
        referralCode: "  NEW-CODE-999  ",
        referralExpiresAt: "2027-01-01",
      });

      expect(result).toEqual(updated);
      expect(student.update).toHaveBeenCalledWith({
        where: { id: "student-uuid-1" },
        data: {
          referralCode: "NEW-CODE-999",
          referralExpiresAt: new Date("2027-01-01"),
        },
        select: expect.any(Object),
      });
    });

    it("updates student with null referral fields when explicitly cleared", async () => {
      const cleared = {
        ...sampleStudent,
        referralCode: null,
        referralExpiresAt: null,
      };
      student.update.mockResolvedValue(cleared);

      const result = await repository.update("student-uuid-1", {
        referralCode: null,
        referralExpiresAt: null,
      });

      expect(result).toEqual(cleared);
      expect(student.update).toHaveBeenCalledWith({
        where: { id: "student-uuid-1" },
        data: {
          referralCode: null,
          referralExpiresAt: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("delete", () => {
    it("soft deletes a student by updating deletedAt", async () => {
      const deletedStudent = {
        ...sampleStudent,
        deletedAt: new Date(),
      };
      student.update.mockResolvedValue(deletedStudent);

      const result = await repository.delete("student-uuid-1");

      expect(result).toEqual(deletedStudent);
      expect(student.update).toHaveBeenCalledWith({
        where: { id: "student-uuid-1" },
        data: { deletedAt: expect.any(Date) },
        select: expect.any(Object),
      });
    });
  });
});
