import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { AssignmentTypeService } from "./assignment-type.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AssignmentTypeService", () => {
  let service: AssignmentTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentTypeService,
        {
          provide: PrismaService,
          useValue: {
            client: {},
          },
        },
      ],
    }).compile();

    service = module.get<AssignmentTypeService>(AssignmentTypeService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
