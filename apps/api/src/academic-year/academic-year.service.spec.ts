import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { AcademicYearRepository } from "@repo/shared/infrastructure/repository/academic-year.repository";
import type {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from "@repo/shared/schemas/academic-year.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { AcademicYearService } from "./academic-year.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";
const INSTITUTION_A = "aaaaaaaa-0000-0000-0000-000000000001";
const INSTITUTION_B = "bbbbbbbb-0000-0000-0000-000000000002";

interface PrismaClientStub {
  profile: { findFirst: jest.Mock };
}

describe("AcademicYearService", () => {
  let service: AcademicYearService;
  let profileFindFirst: jest.Mock;

  beforeEach(() => {
    profileFindFirst = jest.fn();
    service = new AcademicYearService({
      client: { profile: { findFirst: profileFindFirst } } as PrismaClientStub,
    } as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /** Simulate an authenticated admin whose profile belongs to `institutionId`. */
  const mockInstitution = (institutionId: string | null = INSTITUTION_A) => {
    profileFindFirst.mockResolvedValue(
      institutionId === null ? null : { institutionId },
    );
  };

  describe("institution resolution", () => {
    it("rejects every operation when the caller has no institution profile", async () => {
      mockInstitution(null);

      await expect(service.findAll(ADMIN_USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(
        service.findOne("year-id", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.create(
          { academic_year: "2026/2027" } as CreateAcademicYearDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.update(
          "year-id",
          { is_active: true } as UpdateAcademicYearDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.remove("year-id", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("looks the profile up from the authenticated user id only", async () => {
      mockInstitution();
      jest
        .spyOn(AcademicYearRepository.prototype, "findAll")
        .mockResolvedValue([]);

      await service.findAll(ADMIN_USER_ID);

      expect(profileFindFirst).toHaveBeenCalledWith({
        where: { userId: ADMIN_USER_ID, deletedAt: null },
        select: { institutionId: true },
      });
    });
  });

  describe("findAll", () => {
    it("scopes the query to the caller's institution", async () => {
      mockInstitution(INSTITUTION_A);
      const findAll = jest
        .spyOn(AcademicYearRepository.prototype, "findAll")
        .mockResolvedValue([]);

      await service.findAll(ADMIN_USER_ID);

      expect(findAll).toHaveBeenCalledWith({ institution_id: INSTITUTION_A });
    });

    it("passes a different institution scope for a different admin", async () => {
      mockInstitution(INSTITUTION_B);
      const findAll = jest
        .spyOn(AcademicYearRepository.prototype, "findAll")
        .mockResolvedValue([]);

      await service.findAll(ADMIN_USER_ID);

      expect(findAll).toHaveBeenCalledWith({ institution_id: INSTITUTION_B });
    });
  });

  describe("findOne", () => {
    it("rejects a missing academic year", async () => {
      mockInstitution();
      const findById = jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.findOne("missing-id", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(findById).toHaveBeenCalledWith("missing-id", INSTITUTION_A);
    });

    it("treats an academic year owned by another institution as missing", async () => {
      mockInstitution(INSTITUTION_A);
      // The repository honours the institution filter, so a foreign row is
      // returned as null and the service surfaces a 404 instead of the data.
      const findById = jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.findOne("foreign-year", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(findById).toHaveBeenCalledWith("foreign-year", INSTITUTION_A);
    });

    it("returns the academic year when it belongs to the caller", async () => {
      mockInstitution();
      jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue({
          id: "year-id",
          academic_year: "2026/2027",
        } as never);

      await expect(service.findOne("year-id", ADMIN_USER_ID)).resolves.toEqual({
        id: "year-id",
        academic_year: "2026/2027",
      });
    });
  });

  describe("create", () => {
    it("rejects duplicate years inside the same institution", async () => {
      mockInstitution();
      const findByAcademicYear = jest
        .spyOn(AcademicYearRepository.prototype, "findByAcademicYear")
        .mockResolvedValue({ id: "existing-id" } as never);
      const create = jest.spyOn(AcademicYearRepository.prototype, "create");

      await expect(
        service.create(
          { academic_year: "2026/2027" } as CreateAcademicYearDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(findByAcademicYear).toHaveBeenCalledWith(
        "2026/2027",
        INSTITUTION_A,
      );
      expect(create).not.toHaveBeenCalled();
    });

    it("allows the same label in a different institution", async () => {
      mockInstitution(INSTITUTION_B);
      const findByAcademicYear = jest
        .spyOn(AcademicYearRepository.prototype, "findByAcademicYear")
        .mockResolvedValue(null);
      jest
        .spyOn(AcademicYearRepository.prototype, "create")
        .mockResolvedValue({ id: "new-id" } as never);

      await service.create(
        { academic_year: "2026/2027" } as CreateAcademicYearDto,
        ADMIN_USER_ID,
      );

      expect(findByAcademicYear).toHaveBeenCalledWith(
        "2026/2027",
        INSTITUTION_B,
      );
    });

    it("stamps the record with the resolved institution and defaults is_active", async () => {
      mockInstitution();
      jest
        .spyOn(AcademicYearRepository.prototype, "findByAcademicYear")
        .mockResolvedValue(null);
      const create = jest
        .spyOn(AcademicYearRepository.prototype, "create")
        .mockResolvedValue({ id: "new-id" } as never);

      await service.create(
        { academic_year: "2026/2027" } as CreateAcademicYearDto,
        ADMIN_USER_ID,
      );

      expect(create).toHaveBeenCalledWith({
        academic_year: "2026/2027",
        is_active: undefined,
        institution_id: INSTITUTION_A,
      });
    });

    it("forwards an explicit is_active flag", async () => {
      mockInstitution();
      jest
        .spyOn(AcademicYearRepository.prototype, "findByAcademicYear")
        .mockResolvedValue(null);
      const create = jest
        .spyOn(AcademicYearRepository.prototype, "create")
        .mockResolvedValue({ id: "new-id" } as never);

      await service.create(
        {
          academic_year: "2026/2027",
          is_active: true,
        } as CreateAcademicYearDto,
        ADMIN_USER_ID,
      );

      expect(create).toHaveBeenCalledWith({
        academic_year: "2026/2027",
        is_active: true,
        institution_id: INSTITUTION_A,
      });
    });
  });

  describe("update", () => {
    it("rejects a label already used by another year in the same institution", async () => {
      mockInstitution();
      jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue({ id: "year-id" } as never);
      jest
        .spyOn(AcademicYearRepository.prototype, "findByAcademicYear")
        .mockResolvedValue({
          id: "other-id",
          academic_year: "2027/2028",
        } as never);
      const update = jest.spyOn(AcademicYearRepository.prototype, "update");

      await expect(
        service.update(
          "year-id",
          { academic_year: "2027/2028" } as UpdateAcademicYearDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(update).not.toHaveBeenCalled();
    });

    it("allows re-saving the year's own label unchanged", async () => {
      mockInstitution();
      jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue({ id: "year-id" } as never);
      const findByAcademicYear = jest
        .spyOn(AcademicYearRepository.prototype, "findByAcademicYear")
        .mockResolvedValue({
          id: "year-id",
          academic_year: "2026/2027",
        } as never);
      const update = jest
        .spyOn(AcademicYearRepository.prototype, "update")
        .mockResolvedValue({ id: "year-id" } as never);

      await service.update(
        "year-id",
        { academic_year: "2026/2027" } as UpdateAcademicYearDto,
        ADMIN_USER_ID,
      );

      expect(findByAcademicYear).toHaveBeenCalledWith(
        "2026/2027",
        INSTITUTION_A,
      );
      expect(update).toHaveBeenCalledWith("year-id", {
        academic_year: "2026/2027",
      });
    });

    it("scopes the uniqueness check to the caller's institution", async () => {
      mockInstitution(INSTITUTION_B);
      jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue({ id: "year-id" } as never);
      const findByAcademicYear = jest
        .spyOn(AcademicYearRepository.prototype, "findByAcademicYear")
        .mockResolvedValue(null);
      jest
        .spyOn(AcademicYearRepository.prototype, "update")
        .mockResolvedValue({ id: "year-id" } as never);

      await service.update(
        "year-id",
        { academic_year: "2026/2027" } as UpdateAcademicYearDto,
        ADMIN_USER_ID,
      );

      expect(findByAcademicYear).toHaveBeenCalledWith(
        "2026/2027",
        INSTITUTION_B,
      );
    });

    it("updates and soft-deletes an academic year", async () => {
      mockInstitution();
      jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue({ id: "year-id" } as never);
      const update = jest
        .spyOn(AcademicYearRepository.prototype, "update")
        .mockResolvedValue({ id: "year-id" } as never);
      const remove = jest
        .spyOn(AcademicYearRepository.prototype, "delete")
        .mockResolvedValue({ id: "year-id" } as never);

      await service.update(
        "year-id",
        { is_active: true } as UpdateAcademicYearDto,
        ADMIN_USER_ID,
      );
      await expect(service.remove("year-id", ADMIN_USER_ID)).resolves.toEqual({
        success: true,
        id: "year-id",
      });
      expect(update).toHaveBeenCalledWith("year-id", { is_active: true });
      expect(remove).toHaveBeenCalledWith("year-id");
    });

    it("rejects updating an academic year owned by another institution", async () => {
      mockInstitution(INSTITUTION_A);
      jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue(null);
      const update = jest.spyOn(AcademicYearRepository.prototype, "update");

      await expect(
        service.update(
          "foreign-year",
          { is_active: true } as UpdateAcademicYearDto,
          ADMIN_USER_ID,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(update).not.toHaveBeenCalled();
    });

    it("rejects deleting an academic year owned by another institution", async () => {
      mockInstitution(INSTITUTION_A);
      jest
        .spyOn(AcademicYearRepository.prototype, "findById")
        .mockResolvedValue(null);
      const remove = jest.spyOn(AcademicYearRepository.prototype, "delete");

      await expect(
        service.remove("foreign-year", ADMIN_USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
