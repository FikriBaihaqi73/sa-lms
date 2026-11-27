/// <reference types="jest" />

import type { PrismaClient } from "#generated/client";
import { AssignmentSubmissionRepository } from "./assignment-submission.repository";

describe("AssignmentSubmissionRepository", () => {
  let repository: AssignmentSubmissionRepository;
  const mockPrisma = {
    assignmentSubmission: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaClient;

  beforeEach(() => {
    repository = new AssignmentSubmissionRepository(mockPrisma);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("restricts grader fields when listing submissions", async () => {
    const client = mockPrisma.assignmentSubmission;
    jest.mocked(client.findMany).mockResolvedValue([]);
    jest.mocked(client.count).mockResolvedValue(0);

    await repository.findAll({ page: 1, limit: 10 });

    expect(client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          grader: { select: { id: true, email: true } },
        }),
      }),
    );
  });

  it("uses the same restricted grader selection for details", async () => {
    const client = mockPrisma.assignmentSubmission;
    jest.mocked(client.findFirst).mockResolvedValue(null);

    await repository.findById("submission-id");

    expect(client.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          grader: { select: { id: true, email: true } },
        }),
      }),
    );
  });
});
