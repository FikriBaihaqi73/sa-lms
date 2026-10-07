import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { SemesterService } from "./semester.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("SemesterService", () => {
  let service: SemesterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemesterService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              semesters: {
                create: jest.fn(),
                findFirst: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
                count: jest.fn(),
              },
              academicYears: {
                findFirst: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<SemesterService>(SemesterService);
  });

  it("should throw BadRequestException if academic_year_id is empty", async () => {
    await expect(
      service.create({
        academic_year_id: "",
        name: "Test",
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
