import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { SubjectService } from "./subject.service";

jest.mock("../prisma/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("SubjectService", () => {
  let service: SubjectService;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    client: {
      profile: {
        findFirst: jest.fn(),
      },
      departments: {
        findFirst: jest.fn(),
      },
      subject: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);

    // We can spy on the manually created repository inside the service if needed,
    // but the easiest way is to mock Prisma directly.
    mockRepository.create = mockPrismaService.client.subject.create;
    mockRepository.findById = mockPrismaService.client.subject.findFirst;
    // Separate fn: aliasing both to findFirst would make mockResolvedValue
    // calls in the same test overwrite each other (findById vs findByCode).
    mockRepository.findByCode = jest.fn();
    mockRepository.findAll = jest.fn().mockImplementation(async () => {
      const data = await mockPrismaService.client.subject.findMany();
      const total = await mockPrismaService.client.subject.count();
      return { data, total };
    });
    mockRepository.update = mockPrismaService.client.subject.update;
    mockRepository.delete = mockPrismaService.client.subject.update;

    // override the internal repository for testing
    Object.defineProperty(service, "subjectRepository", { value: mockRepository, writable: true });
    mockPrismaService.client.profile.findFirst.mockResolvedValue({ institutionId: "institution-a" });
    mockPrismaService.client.departments.findFirst.mockResolvedValue({ id: "department-a" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should successfully create a subject", async () => {
      const createDto = {
        code: "SUB01",
        name: "Math",
        institutionId: "inst-id",
      };
      const expectedResult = { id: "1", ...createDto };
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto, "user-a");

      expect(mockRepository.findByCode).toHaveBeenCalledWith("SUB01", "institution-a");
      expect(mockRepository.create).toHaveBeenCalledWith({ ...createDto, institutionId: "institution-a" });
      expect(result).toEqual(expectedResult);
    });

    it("should throw ConflictException if code already exists", async () => {
      const createDto = {
        code: "SUB01",
        name: "Math",
        institutionId: "inst-id",
      };
      mockRepository.findByCode.mockResolvedValue({ id: "1", ...createDto });

      await expect(service.create(createDto, "user-a")).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("rejects a department outside the admin's institution", async () => {
      mockPrismaService.client.departments.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            code: "SUB01",
            name: "Math",
            institutionId: "client-institution",
            departmentId: "foreign-department",
          },
          "user-a",
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.client.departments.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "foreign-department",
            institution_id: "institution-a",
            deleted_at: null,
          },
        }),
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return a list of subjects and total count", async () => {
      const expectedResult = { data: [{ id: "1", code: "SUB01" }], total: 1 };
      mockRepository.findAll.mockResolvedValue(expectedResult);

      const query = { page: 1, limit: 10 };
      const result = await service.findAll({ ...query, institutionId: "institution-b" }, "user-a");

      expect(mockRepository.findAll).toHaveBeenCalledWith({ ...query, institutionId: "institution-a" });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findOne", () => {
    it("should return a subject if found", async () => {
      const expectedResult = { id: "1", code: "SUB01" };
      mockRepository.findById.mockResolvedValue(expectedResult);

      const result = await service.findOne("1", "user-a");

      expect(mockRepository.findById).toHaveBeenCalledWith("1", "institution-a");
      expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException if not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne("99", "user-a")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should successfully update a subject", async () => {
      const updateDto = { name: "Advanced Math" };
      const existing = { id: "1", code: "SUB01", name: "Math" };
      const expectedResult = { ...existing, ...updateDto };

      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockResolvedValue(expectedResult);

      const result = await service.update("1", updateDto, "user-a");

      expect(mockRepository.findById).toHaveBeenCalledWith("1", "institution-a");
      expect(mockRepository.update).toHaveBeenCalledWith("1", updateDto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw ConflictException if new code already exists", async () => {
      const updateDto = { code: "SUB02" };
      const existing = { id: "1", code: "SUB01" };
      const existingOther = { id: "2", code: "SUB02" };

      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.findByCode.mockResolvedValue(existingOther);

      await expect(service.update("1", updateDto, "user-a")).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw NotFoundException if subject not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update("99", {}, "user-a")).rejects.toThrow(NotFoundException);
    });

    it("rejects assigning a department outside the admin's institution", async () => {
      mockRepository.findById.mockResolvedValue({ id: "subject-a", institutionId: "institution-a" });
      mockPrismaService.client.departments.findFirst.mockResolvedValue(null);

      await expect(
        service.update("subject-a", { departmentId: "foreign-department" }, "user-a"),
      ).rejects.toThrow(NotFoundException);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("allows clearing an existing department assignment", async () => {
      const existing = { id: "subject-a", departmentId: "department-a" };
      const updated = { ...existing, departmentId: null };
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockResolvedValue(updated);

      await expect(
        service.update("subject-a", { departmentId: null }, "user-a"),
      ).resolves.toEqual(updated);

      expect(mockRepository.update).toHaveBeenCalledWith("subject-a", { departmentId: null });
    });
  });

  describe("remove", () => {
    it("should successfully delete a subject", async () => {
      const existing = { id: "1", code: "SUB01" };
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.delete.mockResolvedValue(existing);

      await service.remove("1", "user-a");

      expect(mockRepository.findById).toHaveBeenCalledWith("1", "institution-a");
      expect(mockRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if subject not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove("99", "user-a")).rejects.toThrow(NotFoundException);
    });
  });

  it("does not return a subject from another institution", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.findOne("subject-b", "user-a")).rejects.toThrow(NotFoundException);
    expect(mockRepository.findById).toHaveBeenCalledWith("subject-b", "institution-a");
  });

  it("does not update a subject from another institution", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.update("subject-b", { name: "Changed" }, "user-a")).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepository.findById).toHaveBeenCalledWith("subject-b", "institution-a");
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it("does not delete a subject from another institution", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.remove("subject-b", "user-a")).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepository.findById).toHaveBeenCalledWith("subject-b", "institution-a");
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it("ignores the client institution filter", async () => {
    mockRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    await service.findAll({ page: 1, limit: 10, institutionId: "institution-b" }, "user-a");

    expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, institutionId: "institution-a" });
  });
});
