import {
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { StudentGuardianRepository } from "@repo/shared/infrastructure/repository/student-guardian.repository";
import type { PrismaService } from "../prisma/prisma.service";
import { StudentGuardianService } from "./student-guardian.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("StudentGuardianService", () => {
  const userIdA = "admin-a-id";
  const userIdB = "admin-b-id";
  const institutionA = "institution-a-id";
  const institutionB = "institution-b-id";
  const prisma = { client: { profile: { findFirst: jest.fn() }, student: { findFirst: jest.fn() }, guardian: { findFirst: jest.fn() } } };
  let service: StudentGuardianService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.client.profile.findFirst.mockResolvedValue({ institutionId: institutionA });
    service = new StudentGuardianService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("passes institution scope to the relation list", async () => {
    const findAll = jest.spyOn(StudentGuardianRepository.prototype, "findAll").mockResolvedValue({ data: [], meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 } } as never);
    await service.findAll(userIdA, 1, 10, "student");
    expect(findAll).toHaveBeenCalledWith(1, 10, "student", institutionA);
  });

  it("scopes student selector options to the administrator institution", async () => {
    const { StudentRepository } = await import(
      "@repo/shared/infrastructure/repository/students.repository"
    );
    const findAll = jest
      .spyOn(StudentRepository.prototype, "findAll")
      .mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } } as never);
    await service.studentOptions(userIdA, 1, 20, "alya");
    expect(findAll).toHaveBeenCalledWith({ page: 1, limit: 20, search: "alya", institutionId: institutionA });
  });

  it("does not leak Admin B students into Admin A selector options", async () => {
    const { StudentRepository } = await import(
      "@repo/shared/infrastructure/repository/students.repository"
    );
    const findAll = jest
      .spyOn(StudentRepository.prototype, "findAll")
      .mockImplementation(async (params?: { institutionId?: string }) => {
        // Simulate store with students from two institutions: only rows whose
        // profile.institutionId matches the caller scope are returned.
        const all = [
          { id: "student-a", profile: { institutionId: institutionA } },
          { id: "student-b", profile: { institutionId: institutionB } },
        ];
        return {
          data: all.filter((row) => row.profile.institutionId === params?.institutionId),
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        } as never;
      });
    const optionsA = await service.studentOptions(userIdA, 1, 20);
    expect(findAll).toHaveBeenCalledWith(
      expect.objectContaining({ institutionId: institutionA }),
    );
    expect(optionsA.data.map((row: { id: string }) => row.id)).toEqual(["student-a"]);
    prisma.client.profile.findFirst.mockResolvedValue({ institutionId: institutionB });
    const optionsB = await service.studentOptions(userIdB, 1, 20);
    expect(optionsB.data.map((row: { id: string }) => row.id)).toEqual(["student-b"]);
  });

  it("rejects student selector options without an institution profile", async () => {
    prisma.client.profile.findFirst.mockResolvedValue(null);
    const { StudentRepository } = await import(
      "@repo/shared/infrastructure/repository/students.repository"
    );
    const findAll = jest.spyOn(StudentRepository.prototype, "findAll");
    await expect(service.studentOptions(userIdA, 1, 20)).rejects.toBeInstanceOf(NotFoundException);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("rejects listing when the caller has no institution profile", async () => {
    prisma.client.profile.findFirst.mockResolvedValue(null);
    const findAll = jest.spyOn(StudentGuardianRepository.prototype, "findAll");
    await expect(service.findAll(userIdA, 1, 10)).rejects.toBeInstanceOf(NotFoundException);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("rejects cross-institution student IDs when creating a relation", async () => {
    prisma.client.student.findFirst.mockResolvedValue(null);
    await expect(service.create({ studentId: "student-id", guardianId: "guardian-id" } as never, userIdA)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects duplicate relations within the institution", async () => {
    prisma.client.student.findFirst.mockResolvedValue({ id: "student-id" });
    prisma.client.guardian.findFirst.mockResolvedValue({ id: "guardian-id" });
    jest.spyOn(StudentGuardianRepository.prototype, "findByStudentAndGuardian").mockResolvedValue({ id: "relation-id" } as never);
    await expect(service.create({ studentId: "student-id", guardianId: "guardian-id" } as never, userIdA)).rejects.toBeInstanceOf(ConflictException);
  });

  it("creates a relation when student and guardian share the administrator institution", async () => {
    prisma.client.student.findFirst.mockResolvedValue({ id: "student-id" });
    prisma.client.guardian.findFirst.mockResolvedValue({ id: "guardian-id" });
    jest.spyOn(StudentGuardianRepository.prototype, "findByStudentAndGuardian").mockResolvedValue(null);
    const create = jest.spyOn(StudentGuardianRepository.prototype, "create").mockResolvedValue({ id: "relation-id" } as never);

    await service.create({ studentId: "student-id", guardianId: "guardian-id", isPrimary: true } as never, userIdA);

    expect(prisma.client.student.findFirst).toHaveBeenCalledWith({
      where: { id: "student-id", deletedAt: null, profile: { institutionId: institutionA } },
    });
    expect(prisma.client.guardian.findFirst).toHaveBeenCalledWith({
      where: { id: "guardian-id", deletedAt: null, institutionId: institutionA },
    });
    expect(create).toHaveBeenCalledWith({ studentId: "student-id", guardianId: "guardian-id", isPrimary: true });
  });

  it("rejects guardians that belong to a different institution", async () => {
    prisma.client.student.findFirst.mockResolvedValue({ id: "student-id" });
    prisma.client.guardian.findFirst.mockResolvedValue(null);
    await expect(
      service.create({ studentId: "student-id", guardianId: "foreign-guardian" } as never, userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("scopes findOne to the administrator institution", async () => {
    const findById = jest
      .spyOn(StudentGuardianRepository.prototype, "findById")
      .mockResolvedValue({ id: "relation-id" } as never);
    await service.findOne("relation-id", userIdA);
    expect(findById).toHaveBeenCalledWith("relation-id", institutionA);
  });

  it("does not expose a relation outside the institution", async () => {
    jest.spyOn(StudentGuardianRepository.prototype, "findById").mockResolvedValue(null);
    await expect(service.findOne("relation-id", userIdA)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("does not let Admin A read a relation owned by Admin B", async () => {
    const findById = jest
      .spyOn(StudentGuardianRepository.prototype, "findById")
      .mockImplementation(async (id: string, institutionId: string) => {
        if (institutionId !== institutionB) return null;
        return { id, studentId: "student-b", guardianId: "guardian-b" } as never;
      });
    await expect(service.findOne("relation-b-id", userIdA)).rejects.toBeInstanceOf(NotFoundException);
    expect(findById).toHaveBeenCalledWith("relation-b-id", institutionA);
    prisma.client.profile.findFirst.mockResolvedValue({ institutionId: institutionB });
    await expect(service.findOne("relation-b-id", userIdB)).resolves.toEqual(
      expect.objectContaining({ id: "relation-b-id" }),
    );
  });

  it("does not delete a relation outside the institution", async () => {
    jest.spyOn(StudentGuardianRepository.prototype, "findById").mockResolvedValue(null);
    const remove = jest.spyOn(StudentGuardianRepository.prototype, "delete");
    await expect(service.remove("relation-id", userIdA)).rejects.toBeInstanceOf(NotFoundException);
    expect(remove).not.toHaveBeenCalled();
  });

  it("does not let Admin A update or delete a relation owned by Admin B", async () => {
    jest.spyOn(StudentGuardianRepository.prototype, "findById").mockResolvedValue(null);
    const update = jest.spyOn(StudentGuardianRepository.prototype, "update");
    const remove = jest.spyOn(StudentGuardianRepository.prototype, "delete");
    await expect(
      service.update("relation-b-id", { isPrimary: true } as never, userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove("relation-b-id", userIdA)).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("rejects updating a relation to a cross-institution student", async () => {
    jest
      .spyOn(StudentGuardianRepository.prototype, "findById")
      .mockResolvedValue({ id: "relation-id", studentId: "student-id", guardianId: "guardian-id" } as never);
    prisma.client.student.findFirst.mockResolvedValue(null);
    const update = jest.spyOn(StudentGuardianRepository.prototype, "update");

    await expect(
      service.update("relation-id", { studentId: "foreign-student" } as never, userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects updating a relation to a cross-institution guardian", async () => {
    jest
      .spyOn(StudentGuardianRepository.prototype, "findById")
      .mockResolvedValue({ id: "relation-id", studentId: "student-id", guardianId: "guardian-id" } as never);
    prisma.client.guardian.findFirst.mockResolvedValue(null);
    const update = jest.spyOn(StudentGuardianRepository.prototype, "update");

    await expect(
      service.update("relation-id", { guardianId: "foreign-guardian" } as never, userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects querying guardians of an unknown student", async () => {
    prisma.client.student.findFirst.mockResolvedValue(null);
    await expect(service.findByStudentId("student-id", userIdA)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects querying students of an unknown guardian", async () => {
    prisma.client.guardian.findFirst.mockResolvedValue(null);
    await expect(service.findByGuardianId("guardian-id", userIdA)).rejects.toBeInstanceOf(NotFoundException);
  });
});
