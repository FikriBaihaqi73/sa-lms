/// <reference types="jest" />
import type { PrismaClient } from "#generated/client";
import { ReligionRepository } from "vitest";

describe("ReligionRepository", () => {
  const religion = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const prisma = { religion } as unknown as PrismaClient;
  const repository = new ReligionRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a religion", async () => {
    const result = { id: "religion-id", name: "Islam" };
    religion.create.mockResolvedValue(result);

    await expect(repository.create({ name: "Islam" })).resolves.toEqual(result);
    expect(religion.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: "Islam" } }),
    );
  });

  it("only finds active religions by ID and name", async () => {
    religion.findFirst.mockResolvedValue(null);

    await expect(repository.findById("missing-id")).resolves.toBeNull();
    await expect(repository.findByName("Islam")).resolves.toBeNull();

    expect(religion.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "missing-id", deleted_at: null },
      }),
    );
    expect(religion.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { name: "Islam", deleted_at: null } }),
    );
  });

  it("lists only active religions", async () => {
    const results = [{ id: "religion-id", name: "Islam" }];
    religion.findMany.mockResolvedValue(results);
    religion.count.mockResolvedValue(results.length);

    await expect(repository.findAll()).resolves.toEqual({
      data: results,
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });
    expect(religion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deleted_at: null } }),
    );
    expect(religion.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deleted_at: null } }),
    );
  });

  it("updates only supplied fields", async () => {
    const result = { id: "religion-id", name: "Kristen" };
    religion.update.mockResolvedValue(result);

    await expect(
      repository.update("religion-id", { name: "Kristen" }),
    ).resolves.toEqual(result);
    expect(religion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "religion-id" },
        data: { name: "Kristen" },
      }),
    );
  });

  it("soft-deletes a religion", async () => {
    const result = { id: "religion-id", name: "Islam" };
    religion.update.mockResolvedValue(result);

    await expect(repository.delete("religion-id")).resolves.toEqual(result);
    expect(religion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "religion-id" },
        data: { deleted_at: expect.any(Date) },
      }),
    );
  });
});
