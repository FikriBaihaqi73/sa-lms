/// <reference types="jest" />

import type { PrismaClient } from "#generated/client";
import { ModuleRepository } from "./module.repository";

describe("ModuleRepository", () => {
  const modules = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const prisma = {
    modules,
  } as unknown as PrismaClient;
  const repository = new ModuleRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a learning module record", async () => {
    const input = {
      class_subject_id: "cs-1",
      title: "Module 1",
      description: "Description",
      display_order: 1,
      is_published: true,
      is_locked: false,
    };
    modules.create.mockResolvedValue({ id: "m-1", ...input });

    const result = await repository.create(input);
    expect(result).toEqual({ id: "m-1", ...input });
    expect(modules.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          class_subject_id: "cs-1",
          title: "Module 1",
        }),
      }),
    );
  });

  it("finds a module by ID", async () => {
    modules.findFirst.mockResolvedValue({ id: "m-1", title: "Module 1" });

    const result = await repository.findById("m-1");
    expect(result).toEqual({ id: "m-1", title: "Module 1" });
    expect(modules.findFirst).toHaveBeenCalledWith({
      where: { id: "m-1", deleted_at: null },
      select: expect.any(Object),
    });
  });

  it("finds all modules with pagination and search", async () => {
    modules.findMany.mockResolvedValue([{ id: "m-1", title: "Math Module" }]);
    modules.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10, { search: "Math" });
    expect(result).toEqual({
      data: [{ id: "m-1", title: "Math Module" }],
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });
    expect(modules.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deleted_at: null,
          title: { contains: "Math", mode: "insensitive" },
        }),
        skip: 0,
        take: 10,
      }),
    );
  });

  it("finds modules by class subject ID", async () => {
    modules.findMany.mockResolvedValue([{ id: "m-1", class_subject_id: "cs-1" }]);

    const result = await repository.findByClassSubjectId("cs-1");
    expect(result).toEqual([{ id: "m-1", class_subject_id: "cs-1" }]);
    expect(modules.findMany).toHaveBeenCalledWith({
      where: { class_subject_id: "cs-1", deleted_at: null },
      orderBy: { display_order: "asc" },
      select: expect.any(Object),
    });
  });

  it("updates a module", async () => {
    modules.update.mockResolvedValue({ id: "m-1", title: "Updated" });

    const result = await repository.update("m-1", { title: "Updated" });
    expect(result).toEqual({ id: "m-1", title: "Updated" });
    expect(modules.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "m-1" },
        data: expect.objectContaining({ title: "Updated" }),
      }),
    );
  });

  it("soft-deletes a module", async () => {
    modules.update.mockResolvedValue({ id: "m-1", deleted_at: new Date() });

    const result = await repository.delete("m-1");
    expect(result).toHaveProperty("deleted_at");
    expect(modules.update).toHaveBeenCalledWith({
      where: { id: "m-1" },
      data: { deleted_at: expect.any(Date) },
      select: expect.any(Object),
    });
  });
});

