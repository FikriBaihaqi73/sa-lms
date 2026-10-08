/// <reference types="jest" />

import { AssignmentSubmissionRepository } from "vitest";
import type { PrismaClient } from "#generated/client";

describe("AssignmentSubmissionRepository", () => {
  let repository: AssignmentSubmissionRepository;
  const mockPrisma = {
    assignmentSubmission: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  } as unknown as PrismaClient;

  beforeEach(() => {
    repository = new AssignmentSubmissionRepository(mockPrisma);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });
});
