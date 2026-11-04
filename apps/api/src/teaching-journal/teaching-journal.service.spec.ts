import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { TeachingJournalRepository } from "@repo/shared/infrastructure/repository/journals.repository";
import type { PrismaService } from "../prisma/prisma.service";
import { TeachingJournalService } from "./teaching-journal.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("TeachingJournalService security", () => {
  const profile = jest.fn();
  const service = new TeachingJournalService({
    client: { profile: { findFirst: profile } },
  } as unknown as PrismaService);
  const admin = { institutionId: "A", role: { name: "admin" }, teacher: null };
  const teacher = {
    institutionId: "A",
    role: { name: "teacher" },
    teacher: { id: "T", deleted_at: null },
  };
  beforeEach(() => {
    jest.restoreAllMocks();
    profile.mockReset();
  });
  it("scopes admin listing and forwards filters and pagination", async () => {
    profile.mockResolvedValue(admin);
    const list = jest
      .spyOn(TeachingJournalRepository.prototype, "findAll")
      .mockResolvedValue({
        data: [],
        meta: { totalData: 0, totalPages: 0, currentPage: 2, perPage: 5 },
      });
    await service.findAll(
      2,
      5,
      { search: "x", schedule_id: "s", journal_date: "2026-01-01" },
      "u",
    );
    expect(list).toHaveBeenCalledWith(
      2,
      5,
      { search: "x", schedule_id: "s", journal_date: "2026-01-01" },
      { institutionId: "A" },
    );
  });
  it("scopes admin detail and hides missing or foreign records", async () => {
    profile.mockResolvedValue(admin);
    const find = jest
      .spyOn(TeachingJournalRepository.prototype, "findById")
      .mockResolvedValueOnce({ id: "a" } as never)
      .mockResolvedValueOnce(null);
    await expect(service.findOne("a", "u")).resolves.toEqual({ id: "a" });
    await expect(service.findOne("b", "u")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(find).toHaveBeenCalledWith("b", { institutionId: "A" });
  });
  it.each([
    "create",
    "update",
    "remove",
  ])("rejects admin %s", async (action) => {
    profile.mockResolvedValue(admin);
    const op =
      action === "create"
        ? service.create({ schedule_id: "s" }, "u")
        : action === "update"
          ? service.update("j", {}, "u")
          : service.remove("j", "u");
    await expect(op).rejects.toBeInstanceOf(ForbiddenException);
  });
  it("denies missing institution or teacher profile", async () => {
    profile
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...teacher, teacher: null });
    await expect(service.findOne("j", "u")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.findOne("j", "u")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
  it("creates only in scoped teacher schedule", async () => {
    profile.mockResolvedValue(teacher);
    const create = jest
      .spyOn(TeachingJournalRepository.prototype, "create")
      .mockResolvedValueOnce({ id: "j" } as never)
      .mockResolvedValueOnce(null);
    await expect(service.create({ schedule_id: "own" }, "u")).resolves.toEqual({
      id: "j",
    });
    await expect(
      service.create({ schedule_id: "other" }, "u"),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create).toHaveBeenCalledWith(
      { schedule_id: "other" },
      { institutionId: "A", teacherId: "T" },
      "u",
    );
  });
  it("limits teacher reads to assigned schedules", async () => {
    profile.mockResolvedValue(teacher);
    const find = jest
      .spyOn(TeachingJournalRepository.prototype, "findById")
      .mockResolvedValue(null);
    await expect(service.findOne("foreign", "u")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(find).toHaveBeenCalledWith("foreign", {
      institutionId: "A",
      teacherId: "T",
    });
  });
  it("limits updates and deletion to owner and teacher scope", async () => {
    profile.mockResolvedValue(teacher);
    const update = jest
      .spyOn(TeachingJournalRepository.prototype, "update")
      .mockResolvedValueOnce({ id: "j" } as never)
      .mockResolvedValueOnce(null);
    const remove = jest
      .spyOn(TeachingJournalRepository.prototype, "delete")
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    await expect(service.update("j", { notes: "ok" }, "u")).resolves.toEqual({
      id: "j",
    });
    await expect(service.update("other", {}, "u")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.remove("j", "u")).resolves.toEqual({
      success: true,
      id: "j",
    });
    await expect(service.remove("other", "u")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(update).toHaveBeenCalledWith(
      "other",
      {},
      { institutionId: "A", teacherId: "T" },
      "u",
    );
    expect(remove).toHaveBeenCalledWith(
      "other",
      { institutionId: "A", teacherId: "T" },
      "u",
    );
  });
});
