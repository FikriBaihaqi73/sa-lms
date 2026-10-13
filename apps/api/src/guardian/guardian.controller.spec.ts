import "reflect-metadata";
import { ROLES_KEY } from "../auth/roles.decorator";
import { GuardianController } from "./guardian.controller";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("GuardianController authorization", () => {
  it("restricts the guardians endpoints to the institution admin role", () => {
    const roles: string[] | undefined = Reflect.getMetadata(
      ROLES_KEY,
      GuardianController,
    );
    expect(roles).toEqual(["admin"]);
  });

  it("exposes the expected CRUD endpoints", () => {
    expect(typeof GuardianController.prototype.findAll).toBe("function");
    expect(typeof GuardianController.prototype.findOne).toBe("function");
    expect(typeof GuardianController.prototype.create).toBe("function");
    expect(typeof GuardianController.prototype.update).toBe("function");
    expect(typeof GuardianController.prototype.remove).toBe("function");
  });
});
