import "reflect-metadata";
import { ROLES_KEY } from "../auth/roles.decorator";
import { TeachingJournalController } from "./teaching-journal.controller";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("Teaching journal role metadata", () => {
  it("allows admin and teacher to access all endpoints", () => {
    expect(Reflect.getMetadata(ROLES_KEY, TeachingJournalController)).toEqual([
      "admin",
      "teacher",
    ]);
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        TeachingJournalController.prototype.findAll,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        TeachingJournalController.prototype.findOne,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        TeachingJournalController.prototype.create,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        TeachingJournalController.prototype.update,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        TeachingJournalController.prototype.remove,
      ),
    ).toBeUndefined();
  });
});
