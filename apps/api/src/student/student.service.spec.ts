import { ConflictException, NotFoundException } from "@nestjs/common";
import { StudentRepository } from "@repo/shared/infrastructure/repository/students.repository";
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
    };
  },
}));

describe("StudentService", () => {
  let service: StudentService;
  const mockPrismaClient = {
    student: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPrismaService = {
    client: mockPrismaClient,
  } as unknown as PrismaService;

  const sampleStudentEntity = {
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
      fullName: "Budi Santoso",
      email: "budi@example.com",
    },
  };

  beforeEach(() => {
    service = new StudentService(mockPrismaService);
    jest.clearAllMocks();
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
      jest
        .spyOn(StudentRepository.prototype, "findByProfileId")
        .mockResolvedValue(sampleStudentEntity);

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260001",
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it("throws ConflictException when student number is already in use", async () => {
      jest
        .spyOn(StudentRepository.prototype, "findByStudentNumber")
        .mockResolvedValue(sampleStudentEntity);

      const dto: CreateStudentDto = {
        profileId: "profile-uuid-2",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260001",
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it("creates a student with referralCode and referralExpiresAt", async () => {
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

      const result = await service.create(dto);

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
      const studentWithoutOptional = {
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

      const result = await service.create(dto);

      expect(createSpy).toHaveBeenCalledWith({
        profileId: "profile-uuid-1",
        academicStatusId: "status-uuid-1",
        studentNumber: "20260002",
      });
      expect(result.data).toEqual(studentWithoutOptional);
    });
  });

  describe("findAll", () => {
    it("returns paginated students with default parameters", async () => {
      const pagedResult = {
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

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Students fetched successfully",
        data: pagedResult,
      });
    });

    it("passes search query and custom pagination", async () => {
      const pagedResult = {
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

      const result = await service.findAll(2, 5, "REF-2026");

      expect(findAllSpy).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: "REF-2026",
      });
      expect(result.data).toEqual(pagedResult);
    });
  });

  describe("findById", () => {
    it("returns a student by ID", async () => {
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(sampleStudentEntity);

      const result = await service.findById("student-uuid-1");

      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully retrieved",
        data: sampleStudentEntity,
      });
    });

    it("throws NotFoundException when student is not found", async () => {
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(service.findById("non-existent")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("updates student with new referralCode and referralExpiresAt", async () => {
      const updatedEntity = {
        ...sampleStudentEntity,
        referralCode: "NEW-CODE",
        referralExpiresAt: new Date("2027-01-01T00:00:00.000Z"),
      };

      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(sampleStudentEntity);

      const updateSpy = jest
        .spyOn(StudentRepository.prototype, "update")
        .mockResolvedValue(updatedEntity);

      const dto: UpdateStudentDto = {
        referralCode: "NEW-CODE",
        referralExpiresAt: "2027-01-01",
      };

      const result = await service.update("student-uuid-1", dto);

      expect(updateSpy).toHaveBeenCalledWith("student-uuid-1", {
        referralCode: "NEW-CODE",
        referralExpiresAt: "2027-01-01",
      });
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully updated",
        data: updatedEntity,
      });
    });

    it("throws NotFoundException when updating non-existent student", async () => {
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.update("non-existent", { studentNumber: "20269999" }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("delete", () => {
    it("deletes student when found", async () => {
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(sampleStudentEntity);

      const deleteSpy = jest
        .spyOn(StudentRepository.prototype, "delete")
        .mockResolvedValue(sampleStudentEntity);

      const result = await service.delete("student-uuid-1");

      expect(deleteSpy).toHaveBeenCalledWith("student-uuid-1");
      expect(result).toEqual({
        code: 200,
        status: "success",
        message: "Student successfully deleted",
        data: sampleStudentEntity,
      });
    });

    it("throws NotFoundException when deleting non-existent student", async () => {
      jest
        .spyOn(StudentRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(service.delete("non-existent")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
