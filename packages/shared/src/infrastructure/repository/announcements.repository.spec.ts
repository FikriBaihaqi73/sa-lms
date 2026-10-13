import type { PrismaClient } from "#generated/client";
import { AnnouncementsRepository } from "./announcements.repository";

describe("AnnouncementsRepository", () => {
  it("finds announcements with pagination, search and eager-loaded relations", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      announcements: { findMany, count },
    } as unknown as PrismaClient;
    const repository = new AnnouncementsRepository(prisma);

    await expect(
      repository.findAll(2, 10, { search: "  exam  " }),
    ).resolves.toEqual({
      data: [],
      meta: { totalData: 0, totalPages: 0, currentPage: 2, perPage: 10 },
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        orderBy: { created_at: "desc" },
        select: expect.objectContaining({
          institution: expect.any(Object),
          creator: expect.any(Object),
          updater: expect.any(Object),
          deleter: expect.any(Object),
        }),
        where: expect.objectContaining({
          deleted_at: null,
          OR: expect.arrayContaining([
            { title: { contains: "exam", mode: "insensitive" } },
            { content: { contains: "exam", mode: "insensitive" } },
          ]),
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deleted_at: null,
        }),
      }),
    );
  });

  it("clamps invalid pagination values to the repository limits", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      announcements: { findMany, count },
    } as unknown as PrismaClient;
    const repository = new AnnouncementsRepository(prisma);

    await repository.findAll(0, 1000);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 100 }),
    );
  });
});
