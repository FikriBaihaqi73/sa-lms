import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../auth/roles.decorator";
import { DepartmentsController } from "./departments.controller";
import type { DepartmentsService } from "./departments.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("DepartmentsController", () => {
  let controller: DepartmentsController;
  let service: jest.Mocked<DepartmentsService>;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: "dept-1" }),
      create: jest.fn().mockResolvedValue({ id: "dept-1" }),
      update: jest.fn().mockResolvedValue({ id: "dept-1" }),
      remove: jest.fn().mockResolvedValue({ success: true, id: "dept-1" }),
    } as unknown as jest.Mocked<DepartmentsService>;

    controller = new DepartmentsController(service);
  });

  it("has @Roles('admin') at the class level", () => {
    const reflector = new Reflector();
    const roles = reflector.get<string[]>(ROLES_KEY, DepartmentsController);
    expect(roles).toEqual(["admin"]);
  });

  it("delegates findAll to service with user.sub", async () => {
    const req = { user: { sub: "user-1" } } as never;
    await controller.findAll(req, "1", "10", "search-term");
    expect(service.findAll).toHaveBeenCalledWith(
      1,
      10,
      { search: "search-term" },
      "user-1",
    );
  });

  it("delegates findOne, create, update, and remove with user.sub", async () => {
    const req = { user: { sub: "user-1" } } as never;
    await controller.findOne("dept-1", req);
    expect(service.findOne).toHaveBeenCalledWith("dept-1", "user-1");

    await controller.create({ name: "A", code: "A1" }, req);
    expect(service.create).toHaveBeenCalledWith({ name: "A", code: "A1" }, "user-1");

    await controller.update("dept-1", { name: "B" }, req);
    expect(service.update).toHaveBeenCalledWith("dept-1", { name: "B" }, "user-1");

    await controller.remove("dept-1", req);
    expect(service.remove).toHaveBeenCalledWith("dept-1", "user-1");
  });
});
