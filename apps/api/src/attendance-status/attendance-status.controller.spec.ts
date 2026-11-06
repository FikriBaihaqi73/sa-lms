jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import type { Request } from "express";
import { ROLES_KEY } from "../auth/roles.decorator";
import { AttendanceStatusController } from "./attendance-status.controller";
import { AttendanceStatusService } from "./attendance-status.service";

const ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("AttendanceStatusController", () => {
  let controller: AttendanceStatusController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const request = (): Request & { user: { sub: string } } =>
    ({ user: { sub: ADMIN_USER_ID } }) as unknown as Request & {
      user: { sub: string };
    };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceStatusController],
      providers: [{ provide: AttendanceStatusService, useValue: service }],
    }).compile();
    controller = module.get(AttendanceStatusController);
  });

  it("restricts every endpoint to institution admins", () => {
    expect(
      new Reflector().get<string[]>(ROLES_KEY, AttendanceStatusController),
    ).toEqual(["admin"]);
  });

  it("forwards the authenticated user to the list endpoint", async () => {
    const result = {
      data: [],
      meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 10 },
    };
    service.findAll.mockResolvedValue(result);

    await expect(
      controller.findAll(request(), "1", "10", "Hadir"),
    ).resolves.toEqual(
      ResponseHelper.success(
        result.data,
        "Attendance statuses retrieved successfully",
        200,
        result.meta,
      ),
    );
    expect(service.findAll).toHaveBeenCalledWith(1, 10, "Hadir", ADMIN_USER_ID);
  });

  it("does not accept an institution id from create DTOs", async () => {
    const dto = { name: "Hadir", description: "Present" };
    service.create.mockResolvedValue({ id: "status-id", ...dto });

    await controller.create(dto, request());

    expect(service.create).toHaveBeenCalledWith(dto, ADMIN_USER_ID);
  });
});
