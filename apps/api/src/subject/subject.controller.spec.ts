import "reflect-metadata";
import { ROLES_KEY } from "../auth/roles.decorator";
import { SubjectController } from "./subject.controller";

jest.mock("./subject.service", () => ({
  SubjectService: class SubjectService {},
}));

describe("SubjectController", () => {
  it("restricts all subject mutations and reads to admins", () => {
    expect(Reflect.getMetadata(ROLES_KEY, SubjectController)).toEqual(["admin"]);
  });
});
