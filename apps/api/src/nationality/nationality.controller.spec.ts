import { Test, type TestingModule } from "@nestjs/testing";
import { NationalityController } from "./nationality.controller";
import { NationalityService } from "./nationality.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("NationalityController", () => {
  let controller: NationalityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NationalityController],
      providers: [
        {
          provide: NationalityService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<NationalityController>(NationalityController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
