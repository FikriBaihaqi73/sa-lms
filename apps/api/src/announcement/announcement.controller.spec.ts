import { Test, TestingModule } from "@nestjs/testing";
import { AnnouncementController } from "./announcement.controller";
import { AnnouncementService } from "./announcement.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AnnouncementController", () => {
  let controller: AnnouncementController;
  let service: AnnouncementService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    stats: jest.fn(),
  };

  const mockRequest = {
    user: { sub: "user-1" },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [
        {
          provide: AnnouncementService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AnnouncementController>(AnnouncementController);
    service = module.get<AnnouncementService>(AnnouncementService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should get announcement stats", async () => {
    const statsData = { total: 5, published: 3, draft: 2, active: 2 };
    mockService.stats.mockResolvedValue(statsData);

    const result = await controller.getStats(mockRequest);
    expect(result.data).toEqual(statsData);
    expect(service.stats).toHaveBeenCalledWith({ sub: "user-1" });
  });

  it("should get all announcements with pagination", async () => {
    const listResult = {
      data: [{ id: "ann-1", title: "Pengumuman 1" }],
      meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
    };
    mockService.findAll.mockResolvedValue(listResult);

    const query = { page: 1, limit: 10, search: "Test" };
    const result = await controller.findAll(mockRequest, query as any);

    expect(result.data).toEqual(listResult.data);
    expect(result.meta).toEqual(listResult.meta);
    expect(service.findAll).toHaveBeenCalledWith(query, { sub: "user-1" });
  });

  it("should get announcement by id", async () => {
    const detail = { id: "ann-1", title: "Detail" };
    mockService.findOne.mockResolvedValue(detail);

    const result = await controller.findOne(mockRequest, "ann-1");
    expect(result.data).toEqual(detail);
    expect(service.findOne).toHaveBeenCalledWith("ann-1", { sub: "user-1" });
  });

  it("should create an announcement", async () => {
    const dto = {
      title: "Baru",
      content: "Isi",
      targetAudience: "ALL" as const,
      category: "GENERAL" as const,
      isPublished: true,
    };
    const created = { id: "ann-new", ...dto };
    mockService.create.mockResolvedValue(created);

    const result = await controller.create(mockRequest, dto as any);
    expect(result.data).toEqual(created);
    expect(result.code).toBe(201);
    expect(service.create).toHaveBeenCalledWith(dto, { sub: "user-1" });
  });

  it("should update an announcement", async () => {
    const dto = { title: "Updated" };
    const updated = { id: "ann-1", title: "Updated" };
    mockService.update.mockResolvedValue(updated);

    const result = await controller.update(mockRequest, "ann-1", dto as any);
    expect(result.data).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith("ann-1", dto, {
      sub: "user-1",
    });
  });

  it("should remove an announcement", async () => {
    mockService.remove.mockResolvedValue({ success: true, id: "ann-1" });

    const result = await controller.remove(mockRequest, "ann-1");
    expect(result.data).toEqual({ success: true, id: "ann-1" });
    expect(service.remove).toHaveBeenCalledWith("ann-1", { sub: "user-1" });
  });
});
