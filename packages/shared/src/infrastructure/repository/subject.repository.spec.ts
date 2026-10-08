/// <reference types="jest" />

import type { PrismaClient } from "#generated/client";
import { subjectSelect } from "#selects/subject.select";
import { SubjectRepository } from "vitest";

describe("SubjectRepository", () => {
  let repository: SubjectRepository;

  const mockPrismaClient = {
    subject: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  };

  beforeEach(() => {
    repository = new SubjectRepository(
      mockPrismaClient as unknown as PrismaClient,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should successfully create a subject", async () => {
      const data = {
        code: "SUB01",
        name: "Math",
        institutionId: "inst-id",
      };
      const expectedResult = { id: "1", ...data };
      mockPrismaClient.subject.create.mockResolvedValue(expectedResult);

      const result = await repository.create(data);

      expect(mockPrismaClient.subject.create).toHaveBeenCalledWith({
        data: {
          code: data.code,
          name: data.name,
          credits: null,
          description: null,
          institutionId: data.institutionId,
          departmentId: null,
        },
        select: subjectSelect,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findById", () => {
    it("should return a subject by id", async () => {
      const expectedResult = { id: "1", code: "SUB01" };
      mockPrismaClient.subject.findFirst.mockResolvedValue(expectedResult);

      const result = await repository.findById("1");

      expect(mockPrismaClient.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "1", deletedAt: null },
        select: subjectSelect,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findByCode", () => {
    it("should return a subject by code", async () => {
      const expectedResult = { id: "1", code: "SUB01" };
      mockPrismaClient.subject.findFirst.mockResolvedValue(expectedResult);

      const result = await repository.findByCode("SUB01");

      expect(mockPrismaClient.subject.findFirst).toHaveBeenCalledWith({
        where: { code: "SUB01", deletedAt: null },
        select: subjectSelect,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findAll", () => {
    it("should return paginated subjects", async () => {
      const data = [{ id: "1", code: "SUB01" }];
      const total = 1;
      mockPrismaClient.subject.findMany.mockResolvedValue(data);
      mockPrismaClient.subject.count.mockResolvedValue(total);

      const result = await repository.findAll({
        page: 1,
        limit: 10,
        search: "Math",
      });

      expect(mockPrismaClient.subject.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { code: { contains: "Math", mode: "insensitive" } },
            { name: { contains: "Math", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        select: subjectSelect,
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual({ data, total });
    });
  });

  describe("update", () => {
    it("should successfully update a subject", async () => {
      const data = { name: "Advanced Math" };
      const expectedResult = { id: "1", name: "Advanced Math" };
      mockPrismaClient.subject.update.mockResolvedValue(expectedResult);

      const result = await repository.update("1", data);

      expect(mockPrismaClient.subject.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data,
        select: subjectSelect,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("delete", () => {
    it("should successfully soft delete a subject", async () => {
      const expectedResult = { id: "1" };
      mockPrismaClient.subject.update.mockResolvedValue(expectedResult);

      const result = await repository.delete("1");

      expect(mockPrismaClient.subject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "1" },
          data: { deletedAt: expect.any(Date) },
          select: subjectSelect,
        }),
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
