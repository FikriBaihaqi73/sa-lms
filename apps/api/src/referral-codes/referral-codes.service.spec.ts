import { ConflictException, NotFoundException } from "@nestjs/common";
import { ReferralCodesRepository } from "@repo/shared/infrastructure/repository/referral-codes.repository";
import type { PrismaService } from "../prisma/prisma.service";
import { ReferralCodesService } from "./referral-codes.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {
      referralCodes: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      profile: {
        findFirst: jest.fn(),
      },
      institution: {
        findFirst: jest.fn(),
      },
      departments: {
        findFirst: jest.fn(),
      },
    };
  },
}));

describe("ReferralCodesService", () => {
  let service: ReferralCodesService;
  const mockPrismaClient = {
    referralCodes: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      findFirst: jest.fn(),
    },
    institution: {
      findFirst: jest.fn(),
    },
    departments: {
      findFirst: jest.fn(),
    },
  };

  const mockPrismaService = {
    client: mockPrismaClient,
  } as unknown as PrismaService;

  const sampleReferralCode = {
    id: "ref-uuid-1",
    code: "REF-2026-ABC123",
    institution_id: "inst-uuid-1",
    usage_quota: 10,
    used_count: 0,
    enrollment_year: 2026,
    department_id: "dept-uuid-1",
    expires_at: new Date("2026-12-31"),
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    institution: { id: "inst-uuid-1", name: "SMA Nusantara" },
    department: { id: "dept-uuid-1", name: "IPA", code: "IPA" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReferralCodesService(mockPrismaService);
  });

  describe("create", () => {
    it("creates a referral code with auto-generated code and resolved institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: "inst-uuid-1",
      });
      mockPrismaClient.departments.findFirst.mockResolvedValue({
        id: "dept-uuid-1",
      });
      jest
        .spyOn(ReferralCodesRepository.prototype, "findByCode")
        .mockResolvedValue(null);
      jest
        .spyOn(ReferralCodesRepository.prototype, "create")
        .mockResolvedValue(sampleReferralCode);

      const response = await service.create(
        {
          usageQuota: 10,
          enrollmentYear: 2026,
          departmentId: "dept-uuid-1",
        },
        "user-uuid-1",
      );

      expect(response.status).toBe("success");
      expect(response.data).toEqual(sampleReferralCode);
    });

    it("throws ConflictException when custom code already exists", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: "inst-uuid-1",
      });
      jest
        .spyOn(ReferralCodesRepository.prototype, "findByCode")
        .mockResolvedValue(sampleReferralCode);

      await expect(
        service.create(
          {
            code: "REF-2026-ABC123",
          },
          "user-uuid-1",
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("throws NotFoundException when department does not exist in institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: "inst-uuid-1",
      });
      mockPrismaClient.departments.findFirst.mockResolvedValue(null);
      jest
        .spyOn(ReferralCodesRepository.prototype, "findByCode")
        .mockResolvedValue(null);

      await expect(
        service.create(
          {
            departmentId: "dept-not-found",
          },
          "user-uuid-1",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("returns paginated referral codes", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: "inst-uuid-1",
      });
      jest
        .spyOn(ReferralCodesRepository.prototype, "findAll")
        .mockResolvedValue({
          data: [sampleReferralCode],
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });

      const response = await service.findAll(
        { page: 1, limit: 10, status: "all" },
        "user-uuid-1",
      );

      expect(response.status).toBe("success");
      expect(response.data.data).toHaveLength(1);
    });
  });

  describe("findById", () => {
    it("returns referral code detail when found", async () => {
      jest
        .spyOn(ReferralCodesRepository.prototype, "findById")
        .mockResolvedValue(sampleReferralCode);

      const response = await service.findById("ref-uuid-1");
      expect(response.status).toBe("success");
      expect(response.data).toEqual(sampleReferralCode);
    });

    it("throws NotFoundException when not found", async () => {
      jest
        .spyOn(ReferralCodesRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(service.findById("not-found")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("updates referral code successfully", async () => {
      jest
        .spyOn(ReferralCodesRepository.prototype, "findById")
        .mockResolvedValue(sampleReferralCode);
      jest
        .spyOn(ReferralCodesRepository.prototype, "update")
        .mockResolvedValue({ ...sampleReferralCode, usage_quota: 25 });

      const response = await service.update("ref-uuid-1", { usageQuota: 25 });
      expect(response.status).toBe("success");
      expect(response.data.usage_quota).toBe(25);
    });

    it("throws NotFoundException when referral code does not exist", async () => {
      jest
        .spyOn(ReferralCodesRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(service.update("not-found", {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("toggleActive", () => {
    it("toggles active state and returns appropriate message", async () => {
      jest
        .spyOn(ReferralCodesRepository.prototype, "findById")
        .mockResolvedValue(sampleReferralCode);
      jest
        .spyOn(ReferralCodesRepository.prototype, "toggleActive")
        .mockResolvedValue({ ...sampleReferralCode, is_active: false });

      const response = await service.toggleActive("ref-uuid-1");
      expect(response.status).toBe("success");
      expect(response.data.is_active).toBe(false);
      expect(response.message).toContain("dinonaktifkan");
    });
  });

  describe("delete", () => {
    it("soft deletes referral code", async () => {
      jest
        .spyOn(ReferralCodesRepository.prototype, "findById")
        .mockResolvedValue(sampleReferralCode);
      jest
        .spyOn(ReferralCodesRepository.prototype, "softDelete")
        .mockResolvedValue({ ...sampleReferralCode, deleted_at: new Date() });

      const response = await service.delete("ref-uuid-1");
      expect(response.status).toBe("success");
      expect(response.data.deleted_at).toBeDefined();
    });
  });
});
