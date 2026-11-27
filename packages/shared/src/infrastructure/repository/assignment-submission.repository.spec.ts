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
});
