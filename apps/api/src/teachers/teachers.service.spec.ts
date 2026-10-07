import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { ResponseHelper } from "@repo/shared/http/response";
import { TeacherRepository } from "@repo/shared/infrastructure/repository/teacher.repository";
import { PrismaService } from "../prisma/prisma.service";
import { TeachersService } from "./teachers.service";

// Mock the TeacherRepository constructor
jest.mock("@repo/shared/infrastructure/repository/teacher.repository");

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("TeachersService", () => {
  let service: TeachersService;
  let mockRepositoryInstance: jest.Mocked<TeacherRepository>;

  beforeEach(async () => {
    mockRepositoryInstance = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTeacherNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TeacherRepository>;

    (TeacherRepository as jest.Mock).mockImplementation(
      () => mockRepositoryInstance,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: PrismaService,
          useValue: {
            client: {},
          },
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a teacher and return success response", async () => {
      const createDto = { profile_id: "1", teacher_number: "T001" };
      const teacherEntity = { id: "1", ...createDto };
      mockRepositoryInstance.create.mockResolvedValue(teacherEntity as any);

      const result = await service.create(createDto);

      expect(result).toEqual(
        ResponseHelper.success(teacherEntity, "Teacher successfully created"),
      );
      expect(mockRepositoryInstance.create).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return all teachers", async () => {
      const teachersList = [{ id: "1", teacher_number: "T001" }];
      mockRepositoryInstance.findAll.mockResolvedValue(teachersList as any);

      const result = await service.findAll();

      expect(result).toEqual(
        ResponseHelper.success(teachersList, "Teachers successfully retrieved"),
      );
      expect(mockRepositoryInstance.findAll).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a teacher if found", async () => {
      const teacherEntity = { id: "1", teacher_number: "T001" };
      mockRepositoryInstance.findById.mockResolvedValue(teacherEntity as any);

      const result = await service.findById("1");

      expect(result).toEqual(
        ResponseHelper.success(teacherEntity, "Teacher successfully retrieved"),
      );
      expect(mockRepositoryInstance.findById).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if teacher not found", async () => {
      mockRepositoryInstance.findById.mockResolvedValue(null);

      await expect(service.findById("999")).rejects.toThrow(NotFoundException);
      expect(mockRepositoryInstance.findById).toHaveBeenCalledWith("999");
    });
  });

  describe("update", () => {
    it("should update a teacher if found", async () => {
      const updateDto = { teacher_number: "T002" };
      const existingTeacher = { id: "1", teacher_number: "T001" };
      const updatedTeacher = { id: "1", teacher_number: "T002" };

      mockRepositoryInstance.findById.mockResolvedValue(existingTeacher as any);
      mockRepositoryInstance.update.mockResolvedValue(updatedTeacher as any);

      const result = await service.update("1", updateDto);

      expect(result).toEqual(
        ResponseHelper.success(updatedTeacher, "Teacher successfully updated"),
      );
      expect(mockRepositoryInstance.update).toHaveBeenCalledWith(
        "1",
        expect.any(Object),
      );
    });
  });

  describe("delete", () => {
    it("should delete a teacher if found", async () => {
      const existingTeacher = { id: "1", teacher_number: "T001" };
      const deletedTeacher = {
        id: "1",
        teacher_number: "T001",
        deleted_at: new Date(),
      };

      mockRepositoryInstance.findById.mockResolvedValue(existingTeacher as any);
      mockRepositoryInstance.delete.mockResolvedValue(deletedTeacher as any);

      const result = await service.delete("1");

      expect(result).toEqual(
        ResponseHelper.success(deletedTeacher, "Teacher successfully deleted"),
      );
      expect(mockRepositoryInstance.delete).toHaveBeenCalledWith("1");
    });
  });
});
