import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { AttendanceStatusRepository } from "@repo/shared/infrastructure/repository/attendance-status.repository";
import type { CreateAttendanceStatusDto } from "@repo/shared/schemas/attendance-status.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { AttendanceStatusService } from "./attendance-status.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AttendanceStatusService", () => {
  let service: AttendanceStatusService;
  let profileFindFirst: jest.Mock;

  beforeEach(() => {
    profileFindFirst = jest.fn().mockResolvedValue({ institutionId: "inst-1" });
    service = new AttendanceStatusService({
      client: { profile: { findFirst: profileFindFirst } },
    } as unknown as PrismaService);
  });

  afterEach(() => jest.restoreAllMocks());

  it("requires an institution profile", async () => {
    profileFindFirst.mockResolvedValue(null);

    await expect(
      service.findAll(1, 10, undefined, "user-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("scopes list and detail lookups to the caller institution", async () => {
    const result = {
      data: [],
      meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
    };
    const findAll = jest
      .spyOn(AttendanceStatusRepository.prototype, "findAll")
      .mockResolvedValue(result);
    const findById = jest
      .spyOn(AttendanceStatusRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(service.findAll(1, 10, "Present", "user-1")).resolves.toEqual(
      result,
    );
    await expect(
      service.findOne("missing-id", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findAll).toHaveBeenCalledWith("inst-1", 1, 10, "Present");
    expect(findById).toHaveBeenCalledWith("inst-1", "missing-id");
  });

  it("rejects an active duplicate name in the same institution", async () => {
    jest
      .spyOn(AttendanceStatusRepository.prototype, "findByName")
      .mockResolvedValue({ id: "present-id" } as never);

    await expect(
      service.create(
        { name: "Present" } as CreateAttendanceStatusDto,
        "user-1",
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("maps a unique race to a conflict", async () => {
    jest
      .spyOn(AttendanceStatusRepository.prototype, "findByName")
      .mockResolvedValue(null);
    jest
      .spyOn(AttendanceStatusRepository.prototype, "create")
      .mockRejectedValue({ code: "P2002" });

    await expect(
      service.create(
        { name: "Present" } as CreateAttendanceStatusDto,
        "user-1",
      ),
    ).rejects.toThrow(
      "Attendance status name already exists in this institution",
    );
  });

  it("blocks deleting a status used by active attendance records", async () => {
    jest
      .spyOn(AttendanceStatusRepository.prototype, "findById")
      .mockResolvedValue({ id: "present-id" } as never);
    jest
      .spyOn(AttendanceStatusRepository.prototype, "countUsage")
      .mockResolvedValue(1);

    await expect(service.remove("present-id", "user-1")).rejects.toThrow(
      "Attendance status is still used by attendance records",
    );
  });

  it("allows deleting an unused scoped status", async () => {
    jest
      .spyOn(AttendanceStatusRepository.prototype, "findById")
      .mockResolvedValue({ id: "present-id" } as never);
    jest
      .spyOn(AttendanceStatusRepository.prototype, "countUsage")
      .mockResolvedValue(0);
    const remove = jest
      .spyOn(AttendanceStatusRepository.prototype, "delete")
      .mockResolvedValue({ id: "present-id" } as never);

    await expect(service.remove("present-id", "user-1")).resolves.toEqual({
      success: true,
      id: "present-id",
    });
    expect(remove).toHaveBeenCalledWith("inst-1", "present-id");
  });
});
