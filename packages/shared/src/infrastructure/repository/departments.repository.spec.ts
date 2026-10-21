/// <reference types="jest" />

import type { DepartmentEntity } from "#entities/department.entity";
import type { PrismaClient } from "#generated/client";
import { departmentSelect } from "#selects/departments.select";
import { DepartmentRepository } from "./departments.repository";

describe("DepartmentRepository", () => {
  const create = jest.fn();
  const findFirst = jest.fn();
  const findMany = jest.fn();
  const count = jest.fn();
  const update = jest.fn();
  const updateMany = jest.fn();

  const prisma = {
    departments: { create, findFirst, findMany, count, update },
    teachers: { updateMany },
  } as unknown as PrismaClient;

  const repository = new DepartmentRepository(prisma);
  const mockDept = { id: "dept-1", name: "Akademik", code: "AKAD" } as unknown as DepartmentEntity;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a department and assigns teachers if provided", async () => {
    create.mockResolvedValue(mockDept);
    findFirst.mockResolvedValue({ ...mockDept, teachers: [{ id: "t-1" }] });

    const result = await repository.create({
      name: "Akademik",
      code: "AKAD",
      institution_id: "inst-1",
      teacher_ids: ["t-1", "t-2"],
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        name: "Akademik",
        code: "AKAD",
        institution_id: "inst-1",
      },
      select: departmentSelect,
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["t-1", "t-2"] },
        deleted_at: null,
      },
      data: {
        department_id: "dept-1",
      },
    });
    expect(result).toBeDefined();
  });

  it("finds department by id and institution_id", async () => {
    findFirst.mockResolvedValue(mockDept);

    const result = await repository.findById("dept-1", "inst-1");

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "dept-1",
        deleted_at: null,
        institution_id: "inst-1",
      },
      select: departmentSelect,
    });
    expect(result).toBe(mockDept);
  });

  it("finds all departments with pagination, search, and institution_id", async () => {
    findMany.mockResolvedValue([mockDept]);
    count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10, {
      search: "Akad",
      institution_id: "inst-1",
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deleted_at: null,
        institution_id: "inst-1",
        OR: [
          { name: { contains: "Akad", mode: "insensitive" } },
          { code: { contains: "Akad", mode: "insensitive" } },
        ],
      },
      skip: 0,
      take: 10,
      select: departmentSelect,
      orderBy: { created_at: "desc" },
    });
    expect(result.data).toEqual([mockDept]);
    expect(result.meta.totalData).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it("updates department and synchronizes assigned teachers", async () => {
    update.mockResolvedValue(mockDept);
    findFirst.mockResolvedValue(mockDept);

    await repository.update(
      "dept-1",
      {
        name: "Akademik Baru",
        code: "AKAD2",
        teacher_ids: ["t-1"],
      },
      "inst-1",
    );

    expect(update).toHaveBeenCalledWith({
      where: { id: "dept-1", institution_id: "inst-1" },
      data: { name: "Akademik Baru", code: "AKAD2" },
      select: departmentSelect,
    });
    // Unassign old teachers not in teacher_ids
    expect(updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        department_id: "dept-1",
        id: { notIn: ["t-1"] },
        deleted_at: null,
      },
      data: { department_id: null },
    });
    // Assign new teachers in teacher_ids
    expect(updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: { in: ["t-1"] },
        deleted_at: null,
      },
      data: { department_id: "dept-1" },
    });
  });

  it("soft-deletes a department and unassigns its teachers", async () => {
    update.mockResolvedValue(mockDept);

    await repository.delete("dept-1", "inst-1");

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        department_id: "dept-1",
        deleted_at: null,
      },
      data: {
        department_id: null,
      },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "dept-1", institution_id: "inst-1" },
      data: { deleted_at: expect.any(Date) },
      select: departmentSelect,
    });
  });
});
