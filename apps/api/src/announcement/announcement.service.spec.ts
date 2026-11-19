import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AnnouncementsRepository } from "@repo/shared/infrastructure/repository/announcements.repository";
import { InstitutionRepository } from "@repo/shared/infrastructure/repository/institution.repository";
import type { PrismaService } from "../prisma/prisma.service";
import { AnnouncementService } from "./announcement.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {
      profile: {
        findFirst: jest.fn(),
      },
    };
  },
}));

describe("AnnouncementService", () => {
  let service: AnnouncementService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      client: {
        profile: {
          findFirst: jest.fn().mockResolvedValue({
            institutionId: "inst-1",
          }),
        },
      },
    };
    service = new AnnouncementService(mockPrisma as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("forwards pagination, institution scoping, and search to the repository", async () => {
    const mockData = [
      {
        id: "ann-1",
        title: "Libur Nasional",
        content: JSON.stringify({
          body: "Libur pada tanggal 10",
          targetAudience: "ALL",
          category: "GENERAL",
        }),
        is_published: true,
        institution_id: "inst-1",
      },
    ];
    const result = {
      data: mockData as any,
      meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
    };
    const findAll = jest
      .spyOn(AnnouncementsRepository.prototype, "findAll")
      .mockResolvedValue(result);

    const res = await service.findAll(
      { page: 1, limit: 10, search: "Libur", isPublished: true },
      { sub: "user-1" },
    );

    expect(findAll).toHaveBeenCalledWith(1, 10, {
      search: "Libur",
      institution_id: "inst-1",
      is_published: true,
    });
    expect(res.data[0].targetAudience).toBe("ALL");
    expect(res.data[0].category).toBe("GENERAL");
    expect(res.data[0].contentBody).toBe("Libur pada tanggal 10");
  });

  it("filters results in memory by targetAudience and category", async () => {
    const mockData = [
      {
        id: "ann-1",
        title: "Info Guru",
        content: JSON.stringify({
          body: "Rapat guru",
          targetAudience: "TEACHER",
          category: "ACADEMIC",
        }),
        is_published: true,
        institution_id: "inst-1",
      },
      {
        id: "ann-2",
        title: "Info Siswa",
        content: JSON.stringify({
          body: "Tugas akhir",
          targetAudience: "STUDENT",
          category: "ACADEMIC",
        }),
        is_published: true,
        institution_id: "inst-1",
      },
    ];
    jest.spyOn(AnnouncementsRepository.prototype, "findAll").mockResolvedValue({
      data: mockData as any,
      meta: { totalData: 2, totalPages: 1, currentPage: 1, perPage: 10 },
    });

    const res = await service.findAll(
      { page: 1, limit: 10, targetAudience: "TEACHER" },
      { sub: "user-1" },
    );

    expect(res.data).toHaveLength(1);
    expect(res.data[0].targetAudience).toBe("TEACHER");
  });

  it("rejects a missing announcement", async () => {
    jest
      .spyOn(AnnouncementsRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(
      service.findOne("missing-id", { sub: "user-1" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects request when user has no institution profile", async () => {
    mockPrisma.client.profile.findFirst.mockResolvedValue(null);

    await expect(
      service.findAll({}, { sub: "user-no-inst" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("creates an announcement with formatted content and defaults", async () => {
    jest.spyOn(InstitutionRepository.prototype, "findById").mockResolvedValue({
      id: "inst-1",
      name: "SMK Jaya",
    } as any);

    const createRepo = jest
      .spyOn(AnnouncementsRepository.prototype, "create")
      .mockResolvedValue({
        id: "ann-new",
        title: "Pengumuman Baru",
        content: JSON.stringify({
          body: "Isi pengumuman",
          targetAudience: "STUDENT",
          category: "EVENT",
        }),
        institution_id: "inst-1",
        is_published: true,
      } as any);

    const res = await service.create(
      {
        title: "Pengumuman Baru",
        content: "Isi pengumuman",
        targetAudience: "STUDENT",
        category: "EVENT",
        isPublished: true,
      },
      { sub: "user-1" },
    );

    expect(createRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        institution_id: "inst-1",
        title: "Pengumuman Baru",
        is_published: true,
        created_by: "user-1",
      }),
    );
    expect(res.targetAudience).toBe("STUDENT");
    expect(res.category).toBe("EVENT");
  });

  it("updates an existing announcement", async () => {
    jest
      .spyOn(AnnouncementsRepository.prototype, "findById")
      .mockResolvedValue({
        id: "ann-1",
        title: "Judul Lama",
        content: JSON.stringify({
          body: "Isi lama",
          targetAudience: "ALL",
          category: "GENERAL",
        }),
        institution_id: "inst-1",
        is_published: false,
      } as any);

    const updateRepo = jest
      .spyOn(AnnouncementsRepository.prototype, "update")
      .mockResolvedValue({
        id: "ann-1",
        title: "Judul Baru",
        content: JSON.stringify({
          body: "Isi baru",
          targetAudience: "TEACHER",
          category: "IMPORTANT",
        }),
        institution_id: "inst-1",
        is_published: true,
      } as any);

    const res = await service.update(
      "ann-1",
      {
        title: "Judul Baru",
        content: "Isi baru",
        targetAudience: "TEACHER",
        category: "IMPORTANT",
        isPublished: true,
      },
      { sub: "user-1" },
    );

    expect(updateRepo).toHaveBeenCalledWith(
      "ann-1",
      expect.objectContaining({
        title: "Judul Baru",
        is_published: true,
        updated_by: "user-1",
      }),
    );
    expect(res.targetAudience).toBe("TEACHER");
  });

  it("removes an announcement", async () => {
    jest
      .spyOn(AnnouncementsRepository.prototype, "findById")
      .mockResolvedValue({
        id: "ann-1",
        institution_id: "inst-1",
      } as any);

    const deleteRepo = jest
      .spyOn(AnnouncementsRepository.prototype, "delete")
      .mockResolvedValue({ id: "ann-1" } as any);

    const res = await service.remove("ann-1", { sub: "user-1" });
    expect(deleteRepo).toHaveBeenCalledWith("ann-1", "user-1");
    expect(res).toEqual({ success: true, id: "ann-1" });
  });

  it("calculates announcement stats for the institution", async () => {
    const futureDate = new Date(Date.now() + 86400000);
    const pastDate = new Date(Date.now() - 86400000);

    jest
      .spyOn(AnnouncementsRepository.prototype, "findByInstitutionId")
      .mockResolvedValue([
        { id: "1", is_published: true, expired_at: futureDate } as any,
        { id: "2", is_published: true, expired_at: null } as any,
        { id: "3", is_published: true, expired_at: pastDate } as any,
        { id: "4", is_published: false, expired_at: null } as any,
      ]);

    const stats = await service.stats({ sub: "user-1" });
    expect(stats).toEqual({
      total: 4,
      published: 3,
      draft: 1,
      active: 2,
    });
  });
});
