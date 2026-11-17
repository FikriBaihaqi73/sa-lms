import "reflect-metadata";
import { Test, TestingModule } from "@nestjs/testing";
import { ROLES_KEY } from "../auth/roles.decorator";
import { ExaminationController } from "./examination.controller";
import { ExaminationService } from "./examination.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("ExaminationController", () => {
  let controller: ExaminationController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    stats: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
  const request = { user: { sub: "user-1" } } as unknown as Parameters<
    ExaminationController["create"]
  >[0];

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExaminationController],
      providers: [{ provide: ExaminationService, useValue: service }],
    }).compile();
    controller = module.get(ExaminationController);
  });

  it("requires the admin role for every endpoint", () => {
    expect(Reflect.getMetadata(ROLES_KEY, ExaminationController)).toEqual([
      "admin",
    ]);
  });

  it("passes the token subject to create", async () => {
    service.create.mockResolvedValue({ id: "exam-1" });
    await controller.create(request, {
      classSubjectId: "class-subject-1",
      title: "Ujian",
    });
    expect(service.create).toHaveBeenCalledWith(
      { classSubjectId: "class-subject-1", title: "Ujian" },
      request.user,
    );
  });

  it("passes validated filters to findAll", async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll(request, { page: 1, limit: 10, search: "UTS" });
    expect(service.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 10, search: "UTS" },
      request.user,
    );
  });

  it("exposes stats before the dynamic id route", async () => {
    service.stats.mockResolvedValue({
      total: 0,
      upcoming: 0,
      completed: 0,
      withoutDate: 0,
    });
    await controller.stats(request);
    expect(service.stats).toHaveBeenCalledWith(request.user);
    expect(ExaminationController.prototype.stats).toBeDefined();
  });

  it("keeps update as PUT contract and uses token subject", async () => {
    service.update.mockResolvedValue({ id: "exam-1" });
    await controller.update(request, "exam-1", { title: "Updated" });
    expect(service.update).toHaveBeenCalledWith(
      "exam-1",
      { title: "Updated" },
      request.user,
    );
  });
});
