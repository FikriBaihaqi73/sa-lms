import type { PrismaClient } from "#generated/client";
import { ReferralCodesRepository } from "./referral-codes.repository";

describe("ReferralCodesRepository", () => {
  const referralCodes = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const prisma = {
    referralCodes,
  } as unknown as PrismaClient;

  const repository = new ReferralCodesRepository(prisma);

  const sampleReferralCode = {
    id: "ref-uuid-1",
    code: "REF-2026-ABC123",
    institution_id: "inst-uuid-1",
    usage_quota: 10,
    used_count: 2,
    enrollment_year: 2026,
    department_id: "dept-uuid-1",
    expires_at: new Date("2026-12-31T00:00:00.000Z"),
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    institution: { id: "inst-uuid-1", name: "SMA Nusantara" },
    department: { id: "dept-uuid-1", name: "IPA", code: "IPA" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a referral code successfully", async () => {
      referralCodes.create.mockResolvedValue(sampleReferralCode);

      const result = await repository.create({
        code: "ref-2026-abc123",
        institutionId: "inst-uuid-1",
        usageQuota: 10,
        enrollmentYear: 2026,
        departmentId: "dept-uuid-1",
        expiresAt: "2026-12-31",
      });

      expect(referralCodes.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          code: "REF-2026-ABC123",
          institution_id: "inst-uuid-1",
          usage_quota: 10,
          used_count: 0,
          enrollment_year: 2026,
          department_id: "dept-uuid-1",
          is_active: true,
        }),
        select: expect.any(Object),
      });
      expect(result).toEqual(sampleReferralCode);
    });

    it("creates an unlimited and department-agnostic referral code", async () => {
      const unlimitedCode = {
        ...sampleReferralCode,
        usage_quota: null,
        department_id: null,
        expires_at: null,
      };
      referralCodes.create.mockResolvedValue(unlimitedCode);

      const result = await repository.create({
        code: "REF-2026-UNLIMITED",
        institutionId: "inst-uuid-1",
      });

      expect(referralCodes.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          code: "REF-2026-UNLIMITED",
          usage_quota: null,
          department_id: null,
          expires_at: null,
        }),
        select: expect.any(Object),
      });
      expect(result.usage_quota).toBeNull();
    });
  });

  describe("findById", () => {
    it("returns referral code when found and not deleted", async () => {
      referralCodes.findFirst.mockResolvedValue(sampleReferralCode);

      const result = await repository.findById("ref-uuid-1");
      expect(referralCodes.findFirst).toHaveBeenCalledWith({
        where: { id: "ref-uuid-1", deleted_at: null },
        select: expect.any(Object),
      });
      expect(result).toEqual(sampleReferralCode);
    });

    it("returns null when not found", async () => {
      referralCodes.findFirst.mockResolvedValue(null);

      const result = await repository.findById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("findByCode", () => {
    it("finds case-insensitively", async () => {
      referralCodes.findFirst.mockResolvedValue(sampleReferralCode);

      const result = await repository.findByCode("ref-2026-abc123");
      expect(referralCodes.findFirst).toHaveBeenCalledWith({
        where: {
          code: { equals: "ref-2026-abc123", mode: "insensitive" },
          deleted_at: null,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(sampleReferralCode);
    });
  });

  describe("findAll", () => {
    it("returns paginated data with meta", async () => {
      referralCodes.count.mockResolvedValue(1);
      referralCodes.findMany.mockResolvedValue([sampleReferralCode]);

      const result = await repository.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it("applies status active filter", async () => {
      referralCodes.count.mockResolvedValue(0);
      referralCodes.findMany.mockResolvedValue([]);

      await repository.findAll({ status: "active" });
      expect(referralCodes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: true,
          }),
        }),
      );
    });

    it("applies status inactive filter", async () => {
      referralCodes.count.mockResolvedValue(0);
      referralCodes.findMany.mockResolvedValue([]);

      await repository.findAll({ status: "inactive" });
      expect(referralCodes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: false,
          }),
        }),
      );
    });

    it("filters exhausted status in memory", async () => {
      const exhausted = {
        ...sampleReferralCode,
        usage_quota: 5,
        used_count: 5,
      };
      const nonExhausted = {
        ...sampleReferralCode,
        usage_quota: 10,
        used_count: 2,
      };
      referralCodes.count.mockResolvedValue(2);
      referralCodes.findMany.mockResolvedValue([exhausted, nonExhausted]);

      const result = await repository.findAll({ status: "exhausted" });
      expect(result.data).toEqual([exhausted]);
    });
  });

  describe("update", () => {
    it("updates referral code fields", async () => {
      referralCodes.update.mockResolvedValue(sampleReferralCode);

      const result = await repository.update("ref-uuid-1", {
        usageQuota: 20,
        isActive: false,
      });

      expect(referralCodes.update).toHaveBeenCalledWith({
        where: { id: "ref-uuid-1" },
        data: expect.objectContaining({
          usage_quota: 20,
          is_active: false,
        }),
        select: expect.any(Object),
      });
      expect(result).toEqual(sampleReferralCode);
    });
  });

  describe("toggleActive", () => {
    it("toggles active status from true to false", async () => {
      referralCodes.findFirst.mockResolvedValue(sampleReferralCode);
      referralCodes.update.mockResolvedValue({
        ...sampleReferralCode,
        is_active: false,
      });

      const result = await repository.toggleActive("ref-uuid-1");
      expect(referralCodes.update).toHaveBeenCalledWith({
        where: { id: "ref-uuid-1" },
        data: { is_active: false },
        select: expect.any(Object),
      });
      expect(result.is_active).toBe(false);
    });

    it("throws error if referral code not found", async () => {
      referralCodes.findFirst.mockResolvedValue(null);

      await expect(repository.toggleActive("invalid-id")).rejects.toThrow(
        "Referral code not found",
      );
    });
  });

  describe("softDelete", () => {
    it("sets deleted_at to current timestamp", async () => {
      referralCodes.update.mockResolvedValue({
        ...sampleReferralCode,
        deleted_at: new Date(),
      });

      const result = await repository.softDelete("ref-uuid-1");
      expect(referralCodes.update).toHaveBeenCalledWith({
        where: { id: "ref-uuid-1" },
        data: { deleted_at: expect.any(Date) },
        select: expect.any(Object),
      });
      expect(result.deleted_at).toBeDefined();
    });
  });

  describe("consumeReferralCodeAtomic", () => {
    it("returns null if referral code does not exist", async () => {
      referralCodes.findFirst.mockResolvedValue(null);

      const result = await repository.consumeReferralCodeAtomic("UNKNOWN");
      expect(result).toBeNull();
    });

    it("returns null if referral code is inactive", async () => {
      referralCodes.findFirst.mockResolvedValue({
        ...sampleReferralCode,
        is_active: false,
      });

      const result =
        await repository.consumeReferralCodeAtomic("REF-2026-ABC123");
      expect(result).toBeNull();
    });

    it("returns null if referral code is expired", async () => {
      referralCodes.findFirst.mockResolvedValue({
        ...sampleReferralCode,
        expires_at: new Date("2020-01-01"),
      });

      const result =
        await repository.consumeReferralCodeAtomic("REF-2026-ABC123");
      expect(result).toBeNull();
    });

    it("returns null if quota is exhausted", async () => {
      referralCodes.findFirst.mockResolvedValue({
        ...sampleReferralCode,
        usage_quota: 5,
        used_count: 5,
      });

      const result =
        await repository.consumeReferralCodeAtomic("REF-2026-ABC123");
      expect(result).toBeNull();
    });

    it("atomically increments used_count when valid", async () => {
      referralCodes.findFirst.mockResolvedValue(sampleReferralCode);
      referralCodes.update.mockResolvedValue({
        ...sampleReferralCode,
        used_count: 3,
      });

      const result =
        await repository.consumeReferralCodeAtomic("REF-2026-ABC123");
      expect(referralCodes.update).toHaveBeenCalledWith({
        where: {
          id: sampleReferralCode.id,
          used_count: { lt: 10 },
        },
        data: {
          used_count: { increment: 1 },
        },
        select: expect.any(Object),
      });
      expect(result?.used_count).toBe(3);
    });

    it("handles race condition failure and returns null gracefully", async () => {
      referralCodes.findFirst.mockResolvedValue(sampleReferralCode);
      referralCodes.update.mockRejectedValue(
        new Error("Record to update not found"),
      );

      const result =
        await repository.consumeReferralCodeAtomic("REF-2026-ABC123");
      expect(result).toBeNull();
    });
  });
});
