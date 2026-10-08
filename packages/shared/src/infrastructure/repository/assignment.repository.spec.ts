/// <reference types="jest" />
import type { PrismaClient } from "#generated/client";
import { assignmentSelect } from "#selects/assignment.select";
import { AssignmentRepository } from "vitest";

describe("AssignmentRepository", () => {
  const assignments = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const repository = new AssignmentRepository({
    assignments,
  } as unknown as PrismaClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an assignment with its nullable fields", async () => {
    const item = { id: "assignment-1" };
    assignments.create.mockResolvedValue(item);

    await expect(
      repository.create({
        module_id: "module-1",
        assignment_type_id: "type-1",
        title: "Algebra quiz",
        description: null,
        due_date: null,
        max_score: 100,
      }),
    ).resolves.toEqual(item);

    expect(assignments.create).toHaveBeenCalledWith({
      data: {
        module_id: "module-1",
        assignment_type_id: "type-1",
        title: "Algebra quiz",
        description: null,
        due_date: null,
        max_score: 100,
      },
      select: assignmentSelect,
    });
  });

  it("finds an assignment by ID while eager-loading relations", async () => {
    const item = { id: "assignment-1" };
    assignments.findFirst.mockResolvedValue(item);

    await expect(repository.findById("assignment-1")).resolves.toEqual(item);
    expect(assignments.findFirst).toHaveBeenCalledWith({
      where: { id: "assignment-1", deleted_at: null },
      select: assignmentSelect,
    });
  });

  it("finds assignments with pagination and relation-aware search", async () => {
    const data = [{ id: "assignment-1" }];
    assignments.findMany.mockResolvedValue(data);
    assignments.count.mockResolvedValue(1);

    await expect(
      repository.findAll(2, 5, { search: "Algebra" }),
    ).resolves.toEqual({
      data,
      meta: {
        totalData: 1,
        totalPages: 1,
        currentPage: 2,
        perPage: 5,
      },
    });

    expect(assignments.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        select: assignmentSelect,
        where: expect.objectContaining({
          deleted_at: null,
          OR: expect.arrayContaining([
            { title: { contains: "Algebra", mode: "insensitive" } },
            {
              assignment_type: {
                name: { contains: "Algebra", mode: "insensitive" },
              },
            },
          ]),
        }),
      }),
    );
    expect(assignments.count).toHaveBeenCalled();
  });

  it("soft-deletes an assignment", async () => {
    const item = { id: "assignment-1" };
    assignments.update.mockResolvedValue(item);

    await expect(repository.delete("assignment-1")).resolves.toEqual(item);
    expect(assignments.update).toHaveBeenCalledWith({
      where: { id: "assignment-1" },
      data: { deleted_at: expect.any(Date) },
      select: assignmentSelect,
    });
  });
});
