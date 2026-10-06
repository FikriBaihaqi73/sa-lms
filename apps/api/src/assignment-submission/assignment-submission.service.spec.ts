import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { AssignmentSubmissionService } from "./assignment-submission.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("AssignmentSubmissionService", () => {
  let service: AssignmentSubmissionService;

  const mockPrismaService = {
    client: {
      assignmentSubmission: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentSubmissionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AssignmentSubmissionService>(
      AssignmentSubmissionService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findById", () => {
    it("should throw NotFoundException if not found", async () => {
      mockPrismaService.client.assignmentSubmission.findFirst.mockResolvedValue(
        null,
      );
      await expect(service.findById("123")).rejects.toThrow(NotFoundException);
    });
  });
});
