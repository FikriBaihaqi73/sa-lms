import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import type { StudentEntity } from "@repo/shared/entities/student.entity";
import {
  type FindAllStudentResult,
  StudentRepository,
} from "@repo/shared/infrastructure/repository/students.repository";
import type {
  CreateStudentDto,
  UpdateStudentDto,
} from "@repo/shared/schemas/student.schema";
import type { PrismaService } from "../prisma/prisma.service";
import { StudentService } from "./student.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {
    client = {
      student: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      profile: {
        findFirst: jest.fn(),
      },
    };
  },
}));

describe("StudentService", () => {
  let service: StudentService;
  const mockPrismaClient = {
    departments: { findFirst: jest.fn() },
    student: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      findFirst: jest.fn(),
    },
  };

  const mockPrismaService = {
    client: mockPrismaClient,
  } as unknown as PrismaService;

  const ADMIN_USER_ID = "admin-user-uuid-a";
  const INSTITUTION_A = "institution-uuid-a";
  const INSTITUTION_B = "institution-uuid-b";

  const sampleStudentEntity: StudentEntity = {
    id: "student-uuid-1",
    profileId: "profile-uuid-1",
    departmentId: "dept-uuid-1",
    academicStatusId: "status-uuid-1",
    studentNumber: "20260001",
    enrollmentYear: 2026,
    referralCode: "REF-2026-ABC",
    referralExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    profile: {
      id: "profile-uuid-1",
      userId: "user-uuid-1",
      institutionId: INSTITUTION_A,
      roleId: "role-uuid-1",
      fullName: "Budi Santoso",
      identityNumber: null,
      gender: null,
      birthPlace: null,
      birthDate: null,
      religionId: null,
      nationalityId: null,
      address: null,
      phoneNumber: null,
      email: "budi@example.com",
      photoUrl: null,
      institution: {
        id: INSTITUTION_A,
        name: "Institution A",
        shortName: "Inst A",
      },
      role: {
        id: "role-uuid-1",
        name: "student",
      },
    },
    assignmentSubmissions: [],
  };

  beforeEach(() => {
    service = new StudentService(mockPrismaService);
    jest.clearAllMocks();
    mockPrismaClient.departments.findFirst.mockResolvedValue({
      id: "dept-uuid-1",
    });
    jest
      .spyOn(StudentRepository.prototype, "findByProfileId")
      .mockResolvedValue(null);
    jest
      .spyOn(StudentRepository.prototype, "findByStudentNumber")
      .mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("throws ConflictException when profile is already registered as a student", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        id: "profile-uuid-1",
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "findByProfileId")
        .mockResolvedValue(sampleStudentEntity);

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260001",
      };

      await expect(service.create(dto, ADMIN_USER_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it("throws ConflictException when student number is already in use", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        id: "profile-uuid-2",
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "findByStudentNumber")
        .mockResolvedValue(sampleStudentEntity);

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-2",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260001",
      };

      await expect(service.create(dto, ADMIN_USER_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it("throws ForbiddenException when profile belongs to a different institution", async () => {
      mockPrismaClient.profile.findFirst.mockImplementation(
        async ({ where }: { where: { userId?: string; id?: string } }) => {
          if (where.userId) {
            return { id: "admin-profile-uuid", institutionId: INSTITUTION_A };
          }
          if (where.id === "profile-uuid-2") {
            return { id: "profile-uuid-2", institutionId: INSTITUTION_B };
          }
          return null;
        },
      );

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-2",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260002",
      };

      await expect(service.create(dto, ADMIN_USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it("throws ForbiddenException when user has no profile/institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue(null);

      const dto: CreateStudentDto = {
        academicStatusId: "status-uuid-1",
        studentNumber: "20260003",
      };

      await expect(service.create(dto, ADMIN_USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it("creates a student successfully when profile belongs to same institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        id: "profile-uuid-1",
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "create")
        .mockResolvedValue(sampleStudentEntity);

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-1",
        departmentId: "dept-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260002",
        enrollmentYear: 2026,
        referralCode: "REF-2026-ABC",
        referralExpiresAt: "2026-12-31",
      };

      const result = await service.create(dto, ADMIN_USER_ID);

      expect(mockPrismaClient.profile.findFirst).toHaveBeenCalledWith({
        where: { userId: ADMIN_USER_ID, deletedAt: null },
        select: { institutionId: true },
      });
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully created",
        data: sampleStudentEntity,
      });
    });

    it("creates a student with referralCode and referralExpiresAt", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        id: "profile-uuid-1",
        institutionId: INSTITUTION_A,
      });
      const createSpy = jest
        .spyOn(StudentRepository.prototype, "create")
        .mockResolvedValue(sampleStudentEntity);

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-1",
        departmentId: "dept-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260001",
        enrollmentYear: 2026,
        referralCode: "REF-2026-ABC",
        referralExpiresAt: "2026-12-31",
      };

      const result = await service.create(dto, ADMIN_USER_ID);

      expect(createSpy).toHaveBeenCalledWith({
        profileId: "profile-uuid-1",
        departmentId: "dept-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260001",
        enrollmentYear: 2026,
        referralCode: "REF-2026-ABC",
        referralExpiresAt: "2026-12-31",
      });
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully created",
        data: sampleStudentEntity,
      });
    });

    it("creates a student with minimal fields", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        id: "profile-uuid-1",
        institutionId: INSTITUTION_A,
      });
      const studentWithoutOptional: StudentEntity = {
        ...sampleStudentEntity,
        departmentId: null,
        enrollmentYear: null,
        referralCode: null,
        referralExpiresAt: null,
      };

      const createSpy = jest
        .spyOn(StudentRepository.prototype, "create")
        .mockResolvedValue(studentWithoutOptional);

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260002",
      };

      const result = await service.create(dto, ADMIN_USER_ID);

      expect(createSpy).toHaveBeenCalledWith({
        profileId: "profile-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260002",
      });
      expect(result.data).toEqual(studentWithoutOptional);
    });

    it("rejects a student without profileId", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      const studentWithoutProfile: StudentEntity = {
        ...sampleStudentEntity,
        profileId: null,
        profile: null,
      };

      const createSpy = jest
        .spyOn(StudentRepository.prototype, "create")
        .mockResolvedValue(studentWithoutProfile);

      const findProfileSpy = jest.spyOn(
        StudentRepository.prototype,
        "findByProfileId",
      );

      const dto: CreateStudentDto = {
        academicStatusId: "status-uuid-1",
        studentNumber: "20260003",
      };

      await expect(service.create(dto, ADMIN_USER_ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(findProfileSpy).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("returns paginated students with default parameters", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      const pagedResult: FindAllStudentResult = {
        data: [sampleStudentEntity],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const findAllSpy = jest
        .spyOn(StudentRepository.prototype, "findAll")
        .mockResolvedValue(pagedResult);

      const result = await service.findAll(ADMIN_USER_ID);

      expect(mockPrismaClient.profile.findFirst).toHaveBeenCalledWith({
        where: { userId: ADMIN_USER_ID, deletedAt: null },
        select: { institutionId: true },
      });
      expect(findAllSpy).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        institutionId: INSTITUTION_A,
      });
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Students fetched successfully",
        data: pagedResult,
      });
    });

    it("passes search query and custom pagination", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      const pagedResult: FindAllStudentResult = {
        data: [sampleStudentEntity],
        meta: {
          page: 2,
          limit: 5,
          total: 1,
          totalPages: 1,
        },
      };

      const findAllSpy = jest
        .spyOn(StudentRepository.prototype, "findAll")
        .mockResolvedValue(pagedResult);

      const result = await service.findAll(ADMIN_USER_ID, 2, 5, "REF-2026");

      expect(findAllSpy).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        institutionId: INSTITUTION_A,
        search: "REF-2026",
      });
      expect(result.data).toEqual(pagedResult);
    });

    it("throws ForbiddenException when user has no institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue(null);

      await expect(
        service.findAll(ADMIN_USER_ID, 1, 10),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("rejects a profile without an institution id", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: null,
      });

      await expect(service.findAll(ADMIN_USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe("findById", () => {
    it("returns a student by ID within the same institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(sampleStudentEntity);

      const result = await service.findById(ADMIN_USER_ID, "student-uuid-1");

      expect(mockPrismaClient.profile.findFirst).toHaveBeenCalledWith({
        where: { userId: ADMIN_USER_ID, deletedAt: null },
        select: { institutionId: true },
      });
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully retrieved",
        data: sampleStudentEntity,
      });
    });

    it("throws NotFoundException when student belongs to another institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.findById(ADMIN_USER_ID, "student-uuid-other-institution"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("throws ForbiddenException when user has no institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue(null);

      await expect(
        service.findById(ADMIN_USER_ID, "student-uuid-1"),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe("update", () => {
    it("updates student within the same institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      const updatedEntity: StudentEntity = {
        ...sampleStudentEntity,
        referralCode: "NEW-CODE",
      };

      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(sampleStudentEntity);

      const updateSpy = jest
        .spyOn(StudentRepository.prototype, "update")
        .mockResolvedValue(updatedEntity);

      const dto: UpdateStudentDto = {
        referralCode: "NEW-CODE",
      };

      const result = await service.update(ADMIN_USER_ID, "student-uuid-1", dto);

      expect(updateSpy).toHaveBeenCalledWith(
        "student-uuid-1",
        { referralCode: "NEW-CODE" },
        INSTITUTION_A,
      );
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully updated",
        data: updatedEntity,
      });
    });

    it("throws NotFoundException when updating student from another institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.update(ADMIN_USER_ID, "student-uuid-1", {
          studentNumber: "20269999",
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("throws ForbiddenException when user has no institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue(null);

      await expect(
        service.update(ADMIN_USER_ID, "student-uuid-1", {
          studentNumber: "20269999",
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe("delete", () => {
    it("deletes student within the same institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(sampleStudentEntity);

      const deleteSpy = jest
        .spyOn(StudentRepository.prototype, "delete")
        .mockResolvedValue(sampleStudentEntity);

      const result = await service.delete(ADMIN_USER_ID, "student-uuid-1");

      expect(deleteSpy).toHaveBeenCalledWith("student-uuid-1", INSTITUTION_A);
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully deleted",
        data: sampleStudentEntity,
      });
    });

    it("throws NotFoundException when deleting student from another institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue({
        institutionId: INSTITUTION_A,
      });
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.delete(ADMIN_USER_ID, "student-uuid-1"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("throws ForbiddenException when user has no institution", async () => {
      mockPrismaClient.profile.findFirst.mockResolvedValue(null);

      await expect(
        service.delete(ADMIN_USER_ID, "student-uuid-1"),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
