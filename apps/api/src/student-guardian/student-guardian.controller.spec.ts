import "reflect-metadata";
import { ROLES_KEY } from "../auth/roles.decorator";
import { StudentGuardianController } from "./student-guardian.controller";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("StudentGuardianController authorization", () => {
  it("restricts the student-guardians endpoints to the institution admin role", () => {
    const roles: string[] | undefined = Reflect.getMetadata(
      ROLES_KEY,
      StudentGuardianController,
    );
    expect(roles).toEqual(["admin"]);
  });

  it("exposes the expected relation endpoints", () => {
    expect(typeof StudentGuardianController.prototype.findAll).toBe("function");
    expect(typeof StudentGuardianController.prototype.studentOptions).toBe("function");
    expect(typeof StudentGuardianController.prototype.findOne).toBe("function");
    expect(typeof StudentGuardianController.prototype.findByStudentId).toBe("function");
    expect(typeof StudentGuardianController.prototype.findByGuardianId).toBe("function");
    expect(typeof StudentGuardianController.prototype.create).toBe("function");
    expect(typeof StudentGuardianController.prototype.update).toBe("function");
    expect(typeof StudentGuardianController.prototype.remove).toBe("function");
  });
});
