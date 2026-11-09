import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { TeacherRepository } from "@repo/shared/infrastructure/repository/teacher.repository";
import type {
  CreateTeacherDto,
  UpdateTeacherDto,
} from "@repo/shared/schemas/teacher.schema";
import { PrismaService } from "../prisma/prisma.service";
import { TeachersService } from "./teachers.service";

jest.mock("@repo/shared/infrastructure/repository/teacher.repository");
jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

const ADMIN_ID = "admin-1";
const INSTITUTION_ID = "institution-a";
const OTHER_INSTITUTION_ID = "institution-b";
const ROLE_TEACHER_ID = "role-teacher-1";

describe("TeachersService", () => {
  let service: TeachersService;
  let repository: jest.Mocked<TeacherRepository>;

  // Prisma mocks
  let profileFindFirst: jest.Mock;
  let teachersFindFirst: jest.Mock;
  let usersFindUnique: jest.Mock;
  let usersFindFirst: jest.Mock;
  let roleFindFirst: jest.Mock;
  let departmentsFindFirst: jest.Mock;
  let specializationsFindFirst: jest.Mock;
  let employmentStatusFindFirst: jest.Mock;
  let transactionMock: jest.Mock;

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
    usersFindUnique = jest.fn().mockResolvedValue(null);
    usersFindFirst = jest.fn().mockResolvedValue(null);
    roleFindFirst = jest.fn().mockResolvedValue({ id: ROLE_TEACHER_ID });
    departmentsFindFirst = jest.fn().mockResolvedValue({ id: "dept-1" });
    specializationsFindFirst = jest.fn().mockResolvedValue({ id: "spec-1" });
    employmentStatusFindFirst = jest.fn().mockResolvedValue({ id: "status-1" });

    transactionMock = jest.fn().mockImplementation(async (callback) => {
      const tx = {
        users: {
          create: jest.fn().mockResolvedValue({ id: "user-new-1" }),
          update: jest.fn().mockResolvedValue({ id: "user-new-1" }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        profile: {
          create: jest.fn().mockResolvedValue({ id: "profile-new-1" }),
          update: jest.fn().mockResolvedValue({ id: "profile-new-1" }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        teachers: {
          create: jest.fn().mockResolvedValue({
            id: "teacher-new-1",
            teacher_number: "198501012010011001",
          }),
          update: jest.fn().mockResolvedValue({
            id: "teacher-new-1",
            teacher_number: "198501012010011001",
          }),
        },
      };
      return callback(tx);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              profile: { findFirst: profileFindFirst },
              teachers: { findFirst: teachersFindFirst },
              users: {
                findUnique: usersFindUnique,
                findFirst: usersFindFirst,
              },
              role: { findFirst: roleFindFirst },
              departments: { findFirst: departmentsFindFirst },
              specializations: { findFirst: specializationsFindFirst },
              employmentStatus: { findFirst: employmentStatusFindFirst },
              $transaction: transactionMock,
            },
          },
        },
      ],
    }).compile();
    service = module.get<TeachersService>(TeachersService);
  });

  afterEach(() => jest.clearAllMocks());

  it("is defined", () => expect(service).toBeDefined());

  describe("create (1-Step Onboarding)", () => {
    const validDto: CreateTeacherDto = {
      full_name: "Budi Santoso, M.Pd",
      email: "budi.santoso@school.sch.id",
      password: "password123",
      teacher_number: "198501012010011001",
      gender: "Laki-laki",
      phone: "081234567890",
      join_date: "2024-01-15",
      department_id: "dept-1",
      specialization_id: "spec-1",
      employment_status_id: "status-1",
    };

    it("creates user, profile, and teacher in a single transaction", async () => {
      const response = await service.create(validDto, ADMIN_ID);

      expect(profileFindFirst).toHaveBeenCalledWith({
        where: { userId: ADMIN_ID, deletedAt: null },
        select: { institutionId: true },
      });
      expect(teachersFindFirst).toHaveBeenCalledWith({
        where: {
          teacher_number: validDto.teacher_number.trim(),
          deleted_at: null,
        },
        select: { id: true },
      });
      expect(usersFindUnique).toHaveBeenCalledWith({
        where: { email: validDto.email.toLowerCase() },
        select: { id: true },
      });
      expect(roleFindFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: "teacher", mode: "insensitive" },
          deletedAt: null,
        },
        select: { id: true },
      });
      expect(transactionMock).toHaveBeenCalled();
      expect(response.status).toBe("success");
      expect(response.code).toBe(201);
    });

    it("rejects duplicate NIP with ConflictException", async () => {
      teachersFindFirst.mockResolvedValueOnce({ id: "existing-teacher" });

      await expect(service.create(validDto, ADMIN_ID)).rejects.toThrow(
        ConflictException,
      );
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it("rejects duplicate email with ConflictException", async () => {
      usersFindUnique.mockResolvedValueOnce({ id: "existing-user" });

      await expect(service.create(validDto, ADMIN_ID)).rejects.toThrow(
        ConflictException,
      );
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it("throws NotFoundException if teacher role is missing", async () => {
      roleFindFirst.mockResolvedValueOnce(null);

      await expect(service.create(validDto, ADMIN_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it("throws NotFoundException if department does not belong to institution", async () => {
      departmentsFindFirst.mockResolvedValueOnce(null);

      await expect(service.create(validDto, ADMIN_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(transactionMock).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const existingTeacher = {
      id: "teacher-1",
      profile_id: "profile-1",
      teacher_number: "198501012010011001",
      department_id: "dept-1",
      specialization_id: "spec-1",
      employment_status_id: "status-1",
      join_date: new Date("2024-01-15"),
      profile: {
        id: "profile-1",
        userId: "user-1",
        fullName: "Budi Lama",
        email: "budi.lama@school.sch.id",
        phoneNumber: "081234567890",
        gender: "Laki-laki",
        users: {
          id: "user-1",
          email: "budi.lama@school.sch.id",
        },
      },
    };

    const updateDto: UpdateTeacherDto = {
      full_name: "Budi Baru, S.Pd",
      email: "budi.baru@school.sch.id",
      password: "newpassword123",
      teacher_number: "198501012010011002",
      phone: "089876543210",
      gender: "Laki-laki",
    };

    it("updates teacher, profile, and user records in transaction", async () => {
      teachersFindFirst.mockResolvedValueOnce(existingTeacher);

      const response = await service.update("teacher-1", updateDto, ADMIN_ID);

      expect(teachersFindFirst).toHaveBeenCalledWith({
        where: {
          id: "teacher-1",
          deleted_at: null,
          profile: { institutionId: INSTITUTION_ID },
        },
        include: {
          profile: {
            include: {
              users: true,
            },
          },
        },
      });
      expect(transactionMock).toHaveBeenCalled();
      expect(response.status).toBe("success");
    });

    it("rejects update if teacher does not exist in institution", async () => {
      teachersFindFirst.mockResolvedValueOnce(null);

      await expect(
        service.update("teacher-foreign", updateDto, ADMIN_ID),
      ).rejects.toThrow(NotFoundException);
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it("rejects duplicate NIP if changed to an existing one", async () => {
      teachersFindFirst
        .mockResolvedValueOnce(existingTeacher)
        .mockResolvedValueOnce({ id: "another-teacher" });

      await expect(
        service.update("teacher-1", updateDto, ADMIN_ID),
      ).rejects.toThrow(ConflictException);
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it("rejects duplicate email if changed to an existing email", async () => {
      teachersFindFirst.mockResolvedValueOnce(existingTeacher);
      usersFindFirst.mockResolvedValueOnce({ id: "another-user" });

      await expect(
        service.update("teacher-1", updateDto, ADMIN_ID),
      ).rejects.toThrow(ConflictException);
      expect(transactionMock).not.toHaveBeenCalled();
    });
  });

  describe("institution scoping & queries", () => {
    it("scopes list to the admin institution", async () => {
      repository.findAll.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      await service.findAll(ADMIN_ID, 1, 10, "Budi", "status", "spec");
      expect(repository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: "Budi",
        employmentStatusId: "status",
        specializationId: "spec",
        institutionId: INSTITUTION_ID,
      });
    });

    it("scopes stats to the admin institution", async () => {
      repository.getStats.mockResolvedValue({
        total: 5,
        tetapCount: 3,
        honorerCount: 2,
        specializationCount: 4,
        totalClassAssignments: 10,
        unassignedCount: 1,
      });
      const response = await service.getStats(ADMIN_ID);
      expect(repository.getStats).toHaveBeenCalledWith(INSTITUTION_ID);
      expect(response.data.total).toBe(5);
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

    it("deletes a teacher and cascades soft-delete to user and profile", async () => {
      repository.findByIdInInstitution.mockResolvedValue({
        id: "teacher-1",
        profile_id: "profile-1",
        profile: { userId: "user-1" },
      } as never);

      const response = await service.delete("teacher-1", ADMIN_ID);
      expect(transactionMock).toHaveBeenCalled();
      expect(response.status).toBe("success");
    });

    it("rejects caller without institution profile", async () => {
      profileFindFirst.mockResolvedValue(null);
      await expect(service.findAll(ADMIN_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.findAll).not.toHaveBeenCalled();
    });
  });
});
