import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PrismaClient } from "#generated/client";
import { TeacherRepository } from "./teacher.repository.js";

describe("TeacherRepository", () => {
  const teachers = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const specializations = {
    count: vi.fn(),
  };
  const classSubjects = {
    count: vi.fn(),
  };
  const prisma = { teachers, specializations, classSubjects } as unknown as PrismaClient;
  const repository = new TeacherRepository(prisma);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── create ────────────────────────────────────────────────────────
  describe("create", () => {
    it("creates a teacher with all fields provided", async () => {
      const joinDate = new Date("2024-01-15");
      const mockResult = {
        id: "teacher-uuid-1",
        profile_id: "profile-uuid-1",
        department_id: "dept-uuid-1",
        specialization_id: "spec-uuid-1",
        employment_status_id: "status-uuid-1",
        teacher_number: "TCH-001",
        join_date: joinDate,
        created_at: new Date(),
        updated_at: new Date(),
      };
      teachers.create.mockResolvedValue(mockResult);

      const result = await repository.create({
        profile_id: "profile-uuid-1",
        department_id: "dept-uuid-1",
        specialization_id: "spec-uuid-1",
        employment_status_id: "status-uuid-1",
        teacher_number: "TCH-001",
        join_date: joinDate,
      });

      expect(result).toEqual(mockResult);
      expect(teachers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            profile_id: "profile-uuid-1",
            department_id: "dept-uuid-1",
            specialization_id: "spec-uuid-1",
            employment_status_id: "status-uuid-1",
            teacher_number: "TCH-001",
            join_date: joinDate,
          },
        }),
      );
    });

    it("sets optional fields to null when not provided", async () => {
      const mockResult = {
        id: "teacher-uuid-2",
        profile_id: "profile-uuid-2",
        department_id: null,
        specialization_id: null,
        employment_status_id: null,
        teacher_number: "TCH-002",
        join_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      teachers.create.mockResolvedValue(mockResult);

      const result = await repository.create({
        profile_id: "profile-uuid-2",
        teacher_number: "TCH-002",
      });

      expect(result).toEqual(mockResult);
      expect(teachers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            profile_id: "profile-uuid-2",
            department_id: null,
            specialization_id: null,
            employment_status_id: null,
            teacher_number: "TCH-002",
            join_date: null,
          },
        }),
      );
    });
  });

  // ─── findById ──────────────────────────────────────────────────────
  describe("findById", () => {
    it("returns a teacher when found and not soft-deleted", async () => {
      const mockResult = { id: "teacher-uuid-1", teacher_number: "TCH-001" };
      teachers.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findById("teacher-uuid-1");
      expect(result).toEqual(mockResult);
      expect(teachers.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "teacher-uuid-1", deleted_at: null },
        }),
      );
    });

    it("returns null when teacher is not found or is deleted", async () => {
      teachers.findFirst.mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  // ─── findByTeacherNumber ───────────────────────────────────────────
  describe("findByTeacherNumber", () => {
    it("returns a teacher matching the teacher_number", async () => {
      const mockResult = { id: "teacher-uuid-1", teacher_number: "TCH-001" };
      teachers.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findByTeacherNumber("TCH-001");
      expect(result).toEqual(mockResult);
      expect(teachers.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teacher_number: "TCH-001", deleted_at: null },
        }),
      );
    });

    it("returns null when teacher_number does not exist", async () => {
      teachers.findFirst.mockResolvedValue(null);

      const result = await repository.findByTeacherNumber("TCH-UNKNOWN");
      expect(result).toBeNull();
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────
  describe("findAll", () => {
    it("returns paginated results with default page and limit", async () => {
      const mockList = [{ id: "t-1" }, { id: "t-2" }];
      teachers.findMany.mockResolvedValue(mockList);
      teachers.count.mockResolvedValue(2);

      const result = await repository.findAll();

      expect(result.data).toEqual(mockList);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
      expect(teachers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted_at: null },
          skip: 0,
          take: 10,
          orderBy: { created_at: "desc" },
        }),
      );
    });

    it("applies custom page and limit", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(50);

      const result = await repository.findAll({ page: 3, limit: 5 });

      expect(result.meta).toEqual({
        page: 3,
        limit: 5,
        total: 50,
        totalPages: 10,
      });
      expect(teachers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5,
        }),
      );
    });

    it("clamps page to minimum 1 and limit between 1 and 100", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      await repository.findAll({ page: -5, limit: 999 });

      expect(teachers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 100,
        }),
      );
    });

    it("clamps limit to minimum 1 when 0 is given", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      await repository.findAll({ limit: 0 });

      expect(teachers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
        }),
      );
    });

    it("applies search filter across teacher_number, fullName, and email", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      await repository.findAll({ search: "john" });

      expect(teachers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deleted_at: null,
            OR: [
              { teacher_number: { contains: "john", mode: "insensitive" } },
              { profile: { fullName: { contains: "john", mode: "insensitive" } } },
              { profile: { email: { contains: "john", mode: "insensitive" } } },
            ],
          }),
        }),
      );
    });

    it("applies employmentStatusId filter", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      await repository.findAll({ employmentStatusId: "status-uuid-1" });

      expect(teachers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employment_status_id: "status-uuid-1",
          }),
        }),
      );
    });

    it("applies specializationId filter", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      await repository.findAll({ specializationId: "spec-uuid-1" });

      expect(teachers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            specialization_id: "spec-uuid-1",
          }),
        }),
      );
    });

    it("applies all filters simultaneously", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      await repository.findAll({
        search: "test",
        employmentStatusId: "status-1",
        specializationId: "spec-1",
        page: 2,
        limit: 20,
      });

      const callArg = (teachers.findMany.mock.calls as any)[0][0];
      expect(callArg.where.deleted_at).toBeNull();
      expect(callArg.where.employment_status_id).toBe("status-1");
      expect(callArg.where.specialization_id).toBe("spec-1");
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.skip).toBe(20);
      expect(callArg.take).toBe(20);
    });

    it("does not add search filter when search is whitespace-only", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      await repository.findAll({ search: "   " });

      const callArg = (teachers.findMany.mock.calls as any)[0][0];
      expect(callArg.where.OR).toBeUndefined();
    });

    it("returns empty data and zero totalPages when no records", async () => {
      teachers.findMany.mockResolvedValue([]);
      teachers.count.mockResolvedValue(0);

      const result = await repository.findAll();
      expect(result.data).toEqual([]);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  // ─── getStats ──────────────────────────────────────────────────────
  describe("getStats", () => {
    it("returns correct stats with tetap and honorer counts", async () => {
      teachers.count
        .mockResolvedValueOnce(5) // total count
        .mockResolvedValueOnce(2); // unassigned count
      teachers.findMany.mockResolvedValue([
        { employment_status: { name: "Guru Tetap" } },
        { employment_status: { name: "Guru Tetap" } },
        { employment_status: { name: "Honorer" } },
        { employment_status: { name: "Kontrak" } },
        { employment_status: { name: "Magang" } },
      ]);
      specializations.count.mockResolvedValue(10);
      classSubjects.count.mockResolvedValue(25);

      const result = await repository.getStats();

      expect(result).toEqual({
        total: 5,
        tetapCount: 2,
        honorerCount: 2,
        specializationCount: 10,
        totalClassAssignments: 25,
        unassignedCount: 2,
      });
    });

    it("handles null employment_status gracefully", async () => {
      teachers.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0);
      teachers.findMany.mockResolvedValue([
        { employment_status: null },
        { employment_status: { name: null } },
      ]);
      specializations.count.mockResolvedValue(0);
      classSubjects.count.mockResolvedValue(0);

      const result = await repository.getStats();

      expect(result.tetapCount).toBe(0);
      expect(result.honorerCount).toBe(0);
      expect(result.total).toBe(2);
    });

    it("returns all zeros when there are no teachers", async () => {
      teachers.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      teachers.findMany.mockResolvedValue([]);
      specializations.count.mockResolvedValue(0);
      classSubjects.count.mockResolvedValue(0);

      const result = await repository.getStats();

      expect(result).toEqual({
        total: 0,
        tetapCount: 0,
        honorerCount: 0,
        specializationCount: 0,
        totalClassAssignments: 0,
        unassignedCount: 0,
      });
    });

    it("normalizes status names with extra whitespace", async () => {
      teachers.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);
      teachers.findMany.mockResolvedValue([
        { employment_status: { name: "  Tetap  " } },
      ]);
      specializations.count.mockResolvedValue(0);
      classSubjects.count.mockResolvedValue(0);

      const result = await repository.getStats();

      expect(result.tetapCount).toBe(1);
    });
  });

  // ─── update ────────────────────────────────────────────────────────
  describe("update", () => {
    it("updates all provided fields", async () => {
      const joinDate = new Date("2025-06-01");
      const mockResult = {
        id: "teacher-uuid-1",
        profile_id: "new-profile",
        department_id: "new-dept",
        specialization_id: "new-spec",
        employment_status_id: "new-status",
        teacher_number: "TCH-999",
        join_date: joinDate,
      };
      teachers.update.mockResolvedValue(mockResult);

      const result = await repository.update("teacher-uuid-1", {
        profile_id: "new-profile",
        department_id: "new-dept",
        specialization_id: "new-spec",
        employment_status_id: "new-status",
        teacher_number: "TCH-999",
        join_date: joinDate,
      });

      expect(result).toEqual(mockResult);
      expect(teachers.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "teacher-uuid-1" },
          data: expect.objectContaining({
            profile_id: "new-profile",
            department_id: "new-dept",
            specialization_id: "new-spec",
            employment_status_id: "new-status",
            teacher_number: "TCH-999",
            join_date: joinDate,
          }),
        }),
      );
    });

    it("only includes fields that are explicitly provided (partial update)", async () => {
      const mockResult = { id: "teacher-uuid-1", teacher_number: "TCH-UPDATED" };
      teachers.update.mockResolvedValue(mockResult);

      await repository.update("teacher-uuid-1", {
        teacher_number: "TCH-UPDATED",
      });

      const callArg = (teachers.update.mock.calls as any)[0][0];
      expect(callArg.data.teacher_number).toBe("TCH-UPDATED");
      // Fields not provided should NOT appear in the data spread
      expect(callArg.data).not.toHaveProperty("profile_id");
      expect(callArg.data).not.toHaveProperty("department_id");
    });

    it("does not include any data fields when called with empty object", async () => {
      const mockResult = { id: "teacher-uuid-1" };
      teachers.update.mockResolvedValue(mockResult);

      await repository.update("teacher-uuid-1", {});

      const callArg = (teachers.update.mock.calls as any)[0][0];
      expect(callArg.where).toEqual({ id: "teacher-uuid-1" });
      expect(callArg.data).toEqual({});
    });
  });

  // ─── delete ────────────────────────────────────────────────────────
  describe("delete", () => {
    it("soft deletes a teacher by setting deleted_at", async () => {
      const mockDeleted = {
        id: "teacher-uuid-1",
        teacher_number: "TCH-001",
        created_at: new Date(),
        updated_at: new Date(),
      };
      teachers.update.mockResolvedValue(mockDeleted);

      const result = await repository.delete("teacher-uuid-1");

      expect(result).toEqual(mockDeleted);
      expect(teachers.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "teacher-uuid-1" },
          data: {
            deleted_at: expect.any(Date),
          },
        }),
      );
    });
  });
});
