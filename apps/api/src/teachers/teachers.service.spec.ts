import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import { TeacherRepository } from "@repo/shared/infrastructure/repository/teacher.repository";
import type { CreateTeacherDto } from "@repo/shared/schemas/teacher.schema";
import { PrismaService } from "../prisma/prisma.service";
import { TeachersService } from "./teachers.service";

jest.mock("@repo/shared/infrastructure/repository/teacher.repository");
jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const ADMIN_ID = "admin-1";
const INSTITUTION_ID = "institution-a";
const OTHER_INSTITUTION_ID = "institution-b";
const PROFILE_ID = "profile-1";

describe("TeachersService", () => {
  let service: TeachersService;
  let repository: jest.Mocked<TeacherRepository>;
  let profileFindFirst: jest.Mock;
  let teachersFindFirst: jest.Mock;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdInInstitution: jest.fn(),
      findByTeacherNumber: jest.fn(),
      getStats: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TeacherRepository>;
    (TeacherRepository as jest.Mock).mockImplementation(() => repository);
    profileFindFirst = jest
      .fn()
      .mockResolvedValue({ institutionId: INSTITUTION_ID });
    teachersFindFirst = jest.fn().mockResolvedValue(null);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              profile: { findFirst: profileFindFirst },
              teachers: { findFirst: teachersFindFirst },
            },
          },
        },
      ],
    }).compile();
    service = module.get<TeachersService>(TeachersService);
  });

  afterEach(() => jest.clearAllMocks());

  it("is defined", () => expect(service).toBeDefined());

  describe("create", () => {
    it("rejects a missing profile", async () => {
      await expect(
        service.create(
          { teacher_number: "T001" } as unknown as CreateTeacherDto,
          ADMIN_ID,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("creates a teacher with a profile in the admin institution", async () => {
      const dto = {
        profile_id: PROFILE_ID,
        teacher_number: "T001",
      } as CreateTeacherDto;
      const entity = { id: "teacher-1", ...dto };
      repository.create.mockResolvedValue(entity as never);
      await expect(service.create(dto, ADMIN_ID)).resolves.toEqual(
        ResponseHelper.success(entity, "Teacher successfully created"),
      );
      expect(repository.create).toHaveBeenCalledWith({
        profile_id: PROFILE_ID,
        teacher_number: "T001",
      });
    });

    it("rejects a profile from another institution", async () => {
      profileFindFirst.mockResolvedValueOnce({
        institutionId: OTHER_INSTITUTION_ID,
      });
      await expect(
        service.create(
          {
            profile_id: PROFILE_ID,
            teacher_number: "T001",
          } as CreateTeacherDto,
          ADMIN_ID,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("rejects a profile already assigned to another teacher", async () => {
      teachersFindFirst.mockResolvedValueOnce({ id: "existing-teacher" });
      await expect(
        service.create(
          {
            profile_id: PROFILE_ID,
            teacher_number: "T001",
          } as CreateTeacherDto,
          ADMIN_ID,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("maps Prisma P2003 to 404", async () => {
      repository.create.mockRejectedValue({ code: "P2003" });
      await expect(
        service.create(
          {
            profile_id: PROFILE_ID,
            teacher_number: "T001",
          } as CreateTeacherDto,
          ADMIN_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("institution scoping", () => {
    it("scopes list to the admin institution", async () => {
      repository.findAll.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      await service.findAll(ADMIN_ID, 1, 10, "T", "status", "specialization");
      expect(repository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: "T",
        employmentStatusId: "status",
        specializationId: "specialization",
        institutionId: INSTITUTION_ID,
      });
    });

    it("scopes stats to the admin institution", async () => {
      repository.getStats.mockResolvedValue({
        total: 0,
        tetapCount: 0,
        honorerCount: 0,
        specializationCount: 0,
        totalClassAssignments: 0,
        unassignedCount: 0,
      });
      await service.getStats(ADMIN_ID);
      expect(repository.getStats).toHaveBeenCalledWith(INSTITUTION_ID);
    });

    it("does not return a teacher from another institution", async () => {
      repository.findByIdInInstitution.mockResolvedValue(null);
      await expect(
        service.findById("foreign-teacher", ADMIN_ID),
      ).rejects.toThrow(NotFoundException);
      expect(repository.findByIdInInstitution).toHaveBeenCalledWith(
        "foreign-teacher",
        INSTITUTION_ID,
      );
    });

    it("does not update or delete a teacher outside the institution", async () => {
      repository.findByIdInInstitution.mockResolvedValue(null);
      await expect(
        service.update("foreign-teacher", { teacher_number: "T" }, ADMIN_ID),
      ).rejects.toThrow(NotFoundException);
      await expect(service.delete("foreign-teacher", ADMIN_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it("rejects a user without an institution instead of falling back", async () => {
      profileFindFirst.mockResolvedValue(null);
      await expect(service.findAll(ADMIN_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.findAll).not.toHaveBeenCalled();
    });
  });
});
