import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { GuardianRepository } from "@repo/shared/infrastructure/repository/guardian.repository";
import type { PrismaService } from "../prisma/prisma.service";
import { GuardianService } from "./guardian.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("GuardianService", () => {
  const userIdA = "admin-a-id";
  const userIdB = "admin-b-id";
  const institutionA = "institution-a-id";
  const institutionB = "institution-b-id";
  const prisma = {
    client: {
      profile: { findFirst: jest.fn() },
      student: { findFirst: jest.fn() },
    },
  };
  let service: GuardianService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.client.profile.findFirst.mockResolvedValue({
      institutionId: institutionA,
    });
    prisma.client.student.findFirst.mockResolvedValue({ id: "student-id" });
    service = new GuardianService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("scopes guardian lists to the administrator institution", async () => {
    const findAll = jest
      .spyOn(GuardianRepository.prototype, "findAll")
      .mockResolvedValue({
        data: [],
        meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
      });
    await service.findAll(userIdA, 1, 10, { search: "jane" });
    expect(findAll).toHaveBeenCalledWith(1, 10, {
      search: "jane",
      institutionId: institutionA,
    });
  });

  it("rejects an administrator without an institution profile", async () => {
    prisma.client.profile.findFirst.mockResolvedValue(null);
    await expect(
      service.findOne("guardian-id", userIdA),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects listing and creation without an institution profile", async () => {
    prisma.client.profile.findFirst.mockResolvedValue(null);
    const findAll = jest.spyOn(GuardianRepository.prototype, "findAll");
    const create = jest.spyOn(GuardianRepository.prototype, "create");
    await expect(service.findAll(userIdA, 1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.create({ fullName: "Jane Doe" } as never, userIdA),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(findAll).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("does not expose a guardian outside the institution", async () => {
    jest
      .spyOn(GuardianRepository.prototype, "findById")
      .mockResolvedValue(null);
    await expect(
      service.findOne("guardian-id", userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("does not let Admin A read a guardian owned by Admin B", async () => {
    const findById = jest
      .spyOn(GuardianRepository.prototype, "findById")
      .mockImplementation(async (id: string, institutionId: string) => {
        if (institutionId !== institutionB) return null;
        return { id, institutionId } as never;
      });
    await expect(
      service.findOne("guardian-b-id", userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findById).toHaveBeenCalledWith("guardian-b-id", institutionA);
    prisma.client.profile.findFirst.mockResolvedValue({
      institutionId: institutionB,
    });
    await expect(service.findOne("guardian-b-id", userIdB)).resolves.toEqual(
      expect.objectContaining({ id: "guardian-b-id" }),
    );
  });

  it("scopes findOne to the administrator institution", async () => {
    const findById = jest
      .spyOn(GuardianRepository.prototype, "findById")
      .mockResolvedValue({ id: "guardian-id" } as never);
    await service.findOne("guardian-id", userIdA);
    expect(findById).toHaveBeenCalledWith("guardian-id", institutionA);
  });

  it("assigns the administrator institution when creating a guardian", async () => {
    const create = jest
      .spyOn(GuardianRepository.prototype, "create")
      .mockResolvedValue({ id: "guardian-id" } as never);
    await service.create(
      { studentId: "student-id", fullName: "Jane Doe" } as never,
      userIdA,
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        institutionId: institutionA,
        studentId: "student-id",
        fullName: "Jane Doe",
      }),
    );
    // The frontend never supplies the institution; it is always resolved server-side.
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty("institution");
  });

  it("rejects guardian creation when no student is selected", async () => {
    const create = jest.spyOn(GuardianRepository.prototype, "create");

    await expect(
      service.create({ fullName: "Jane Doe" } as never, userIdA),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
    expect(prisma.client.student.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a student outside the administrator institution", async () => {
    prisma.client.student.findFirst.mockResolvedValue(null);
    const create = jest.spyOn(GuardianRepository.prototype, "create");

    await expect(
      service.create(
        { studentId: "foreign-student-id", fullName: "Jane Doe" } as never,
        userIdA,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create).not.toHaveBeenCalled();
    expect(prisma.client.student.findFirst).toHaveBeenCalledWith({
      where: {
        id: "foreign-student-id",
        deletedAt: null,
        profile: { institutionId: institutionA },
      },
      select: { id: true },
    });
  });

  it("creates a guardian with a valid student from the administrator institution", async () => {
    const create = jest
      .spyOn(GuardianRepository.prototype, "create")
      .mockResolvedValue({ id: "guardian-id" } as never);

    await service.create(
      {
        studentId: "student-id",
        fullName: "Jane Doe",
      } as never,
      userIdA,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        institutionId: institutionA,
        studentId: "student-id",
      }),
    );
  });

  it("does not update a guardian outside the institution", async () => {
    jest
      .spyOn(GuardianRepository.prototype, "findById")
      .mockResolvedValue(null);
    const update = jest.spyOn(GuardianRepository.prototype, "update");
    await expect(
      service.update("guardian-id", { fullName: "Hacked" } as never, userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it("does not let Admin A update or delete a guardian owned by Admin B", async () => {
    jest
      .spyOn(GuardianRepository.prototype, "findById")
      .mockResolvedValue(null);
    const update = jest.spyOn(GuardianRepository.prototype, "update");
    const remove = jest.spyOn(GuardianRepository.prototype, "delete");
    await expect(
      service.update("guardian-b-id", { fullName: "Hacked" } as never, userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.remove("guardian-b-id", userIdA),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("does not delete a guardian outside the institution", async () => {
    jest
      .spyOn(GuardianRepository.prototype, "findById")
      .mockResolvedValue(null);
    const remove = jest.spyOn(GuardianRepository.prototype, "delete");
    await expect(service.remove("guardian-id", userIdA)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(remove).not.toHaveBeenCalled();
  });

  it("updates a guardian that belongs to the administrator institution", async () => {
    jest
      .spyOn(GuardianRepository.prototype, "findById")
      .mockResolvedValue({ id: "guardian-id" } as never);
    const update = jest
      .spyOn(GuardianRepository.prototype, "update")
      .mockResolvedValue({ id: "guardian-id" } as never);
    await service.update(
      "guardian-id",
      { fullName: "Jane Smith" } as never,
      userIdA,
    );
    expect(update).toHaveBeenCalledWith("guardian-id", {
      fullName: "Jane Smith",
    });
  });
});
